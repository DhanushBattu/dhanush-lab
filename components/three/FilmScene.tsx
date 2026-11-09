"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The scroll film. One cloud of points with three shapes stored per point:
 *   face    → sampled from Dhanush's real portrait (the same map the hero uses)
 *   ideas   → a loose spiral, the scattered stage
 *   systems → five small lattices, one per project
 * Scroll progress (0..1, from the parent) blends between them on the GPU; the pointer pushes
 * points aside, like the hero.
 */
type Props = {
  progress: React.MutableRefObject<number>;
  active: boolean;
  still?: boolean;
  /** project labels placed under each of the five lattices */
  labels?: React.MutableRefObject<(HTMLElement | null)[]>;
};

const vert = /* glsl */ `
  uniform float uA;      // face → ideas
  uniform float uB;      // ideas → systems
  uniform float uTime;
  uniform vec2  uMouse;  // ndc
  uniform float uAspect;
  uniform float uDpr;
  attribute vec3 aIdea;
  attribute vec3 aGrid;
  attribute vec3 aColFace;
  attribute vec3 aColGrid;
  attribute float aRand;
  varying vec3 vCol;
  varying float vAlpha;

  float ease(float t) { return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0; }

  void main() {
    float a = ease(clamp(uA * 1.45 - aRand * 0.45, 0.0, 1.0));
    float b = ease(clamp(uB * 1.45 - aRand * 0.45, 0.0, 1.0));
    vec3 p = mix(position, aIdea, a);
    p = mix(p, aGrid, b);
    float life = 0.25 + a * (1.0 - b) * 3.0;
    p += 0.018 * life * vec3(sin(uTime * 0.9 + aRand * 40.0), cos(uTime * 0.7 + aRand * 23.0), sin(uTime * 0.5 + aRand * 11.0));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 d = ndc - uMouse;
    d.x *= uAspect;
    float r = length(d);
    float f = smoothstep(0.22, 0.0, r);
    vec2 push = (r > 0.0001 ? d / r : vec2(0.0)) * f * 0.06;
    push.x /= uAspect;
    ndc += push;
    clip.xy = ndc * clip.w;
    gl_Position = clip;

    float size = mix(1.3, 2.1, aRand) * mix(0.8, 1.0, max(a, b)) * mix(1.0, 1.25, a * (1.0 - b));
    gl_PointSize = size * uDpr * (6.0 / -mv.z) * 1.6;

    vec3 ideaCol = mix(vec3(0.96, 0.66, 0.28), vec3(0.93, 0.9, 0.84), step(0.55, aRand));
    vCol = mix(mix(aColFace, ideaCol, a), aColGrid, b);
    vAlpha = mix(mix(0.8, 0.75, a), 1.0, b) + f * 0.3;
  }
`;

const frag = /* glsl */ `
  varying vec3 vCol;
  varying float vAlpha;
  uniform float uShow;   // 0 while the real photo is on screen, 1 once it has dissolved into points
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float m = smoothstep(0.5, 0.1, length(c));
    gl_FragColor = vec4(vCol * m * vAlpha * uShow, m * vAlpha * uShow);
  }
`;

function loadMap(src: string) {
  return new Promise<ImageData>((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const x = c.getContext("2d")!;
      x.drawImage(img, 0, 0);
      res(x.getImageData(0, 0, c.width, c.height));
    };
    img.onerror = rej;
    img.src = src;
  });
}

/** Where project lattice `c` sits: a row of five on wide screens, a 2-2-1 grid on narrow ones. Returns [x, y, size]. */
function cubeAt(c: number, narrow: boolean): [number, number, number] {
  if (!narrow) return [(c - 2) * 1.55, 0.55, 0.86];
  const row = Math.floor(c / 2);
  const x = c === 4 ? 0 : (c % 2 === 0 ? -0.72 : 0.72);
  return [x, 1.9 - row * 1.2, 0.55]; // kept high so the captions underneath stay clear
}

export default function FilmScene({ progress, active, still = false, labels }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      let map: ImageData;
      try {
        map = await loadMap("img/dhanush-portrait-map.png");
      } catch {
        return;
      }
      if (disposed) return;

      let narrow = el.clientWidth / Math.max(1, el.clientHeight) < 0.9;
      const low = window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
      const N = low ? 12000 : 22000;
      const dpr = Math.min(window.devicePixelRatio || 1, low ? 1.5 : 1.75);

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
      } catch {
        return;
      }
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
      el.appendChild(renderer.domElement);

      // ---------- shapes ----------
      const face = new Float32Array(N * 3);
      const idea = new Float32Array(N * 3);
      const grid = new Float32Array(N * 3);
      const unit = new Float32Array(N * 3); // each point's spot on a unit cube, so the layout can change on resize
      const colF = new Float32Array(N * 3);
      const colG = new Float32Array(N * 3);
      const rnd = new Float32Array(N);

      const H = 3.3; // face height in world units
      const W = (H * map.width) / map.height;
      const cubeCols = [
        [0.5, 0.83, 0.63], // real-world project: green
        [0.96, 0.7, 0.36],
        [0.44, 0.78, 0.7],
        [0.96, 0.7, 0.36],
        [0.44, 0.78, 0.7],
      ];
      for (let i = 0; i < N; i++) {
        rnd[i] = Math.random();
        // face: rejection-sample bright, opaque pixels
        let px = 0, py = 0, k = 0, lum = 0;
        for (let tries = 0; tries < 40; tries++) {
          px = Math.random() * map.width;
          py = Math.random() * map.height;
          k = ((py | 0) * map.width + (px | 0)) * 4;
          const al = map.data[k + 3] / 255;
          lum = (0.3 * map.data[k] + 0.59 * map.data[k + 1] + 0.11 * map.data[k + 2]) / 255;
          if (al > 0.5 && Math.random() < 0.03 + Math.pow(lum, 1.8) * 2.2) break;
        }
        face[i * 3] = (px / map.width - 0.5) * W;
        face[i * 3 + 1] = (0.5 - py / map.height) * H;
        face[i * 3 + 2] = (lum - 0.45) * 0.5;
        // keep the photo's contrast: dark pixels stay dark, bright ones glow
        // a contrast curve: shadows sink, highlights glow, so eyes, nose and mouth read
        const curve = (v: number) => Math.min(1, Math.pow(v / 255, 1.7) * 2.1);
        colF.set([curve(map.data[k]), curve(map.data[k + 1]), curve(map.data[k + 2])], i * 3);

        // ideas: a loose three-arm spiral
        const arm = (i % 3) * ((Math.PI * 2) / 3);
        const r = 0.6 + Math.pow(Math.random(), 0.7) * 5.2;
        const ang = arm + r * 0.55 + (Math.random() - 0.5) * 0.9;
        idea.set([Math.cos(ang) * r, (Math.random() - 0.5) * (0.4 + r * 0.12), Math.sin(ang) * r * 0.6], i * 3);

        // systems: five lattices (row on wide screens, column on narrow ones)
        const c = i % 5;
        const g = 6;
        const q = () => Math.floor(Math.random() * (g + 1)) / g - 0.5;
        let gx = q(), gy = q(), gz = q();
        const face3 = Math.floor(Math.random() * 3); // keep points on the cube's surface
        if (face3 === 0) gx = Math.sign(gx || 1) * 0.5;
        else if (face3 === 1) gy = Math.sign(gy || 1) * 0.5;
        else gz = Math.sign(gz || 1) * 0.5;
        unit.set([gx, gy, gz], i * 3);
        colG.set(cubeCols[c], i * 3);
      }
      // place the five lattices: a row on wide screens, 2-2-1 on narrow ones
      const layout = () => {
        for (let i = 0; i < N; i++) {
          const [cx, cy, s] = cubeAt(i % 5, narrow);
          grid[i * 3] = cx + unit[i * 3] * s;
          grid[i * 3 + 1] = cy + unit[i * 3 + 1] * s;
          grid[i * 3 + 2] = unit[i * 3 + 2] * s;
        }
      };
      layout();

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(face, 3));
      geo.setAttribute("aIdea", new THREE.BufferAttribute(idea, 3));
      geo.setAttribute("aGrid", new THREE.BufferAttribute(grid, 3));
      geo.setAttribute("aColFace", new THREE.BufferAttribute(colF, 3));
      geo.setAttribute("aColGrid", new THREE.BufferAttribute(colG, 3));
      geo.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));

      const uniforms = {
        uA: { value: 0 },
        uShow: { value: still ? 1 : 0 },
        uB: { value: 0 },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(9, 9) },
        uAspect: { value: 1 },
        uDpr: { value: dpr },
      };
      const mat = new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const pts = new THREE.Points(geo, mat);
      pts.frustumCulled = false;
      const scene = new THREE.Scene();
      scene.add(pts);
      const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);

      const resize = () => {
        const w = el.clientWidth, h = el.clientHeight;
        renderer.setSize(w, h, false);
        cam.aspect = w / Math.max(1, h);
        cam.updateProjectionMatrix();
        uniforms.uAspect.value = cam.aspect;
        const n = cam.aspect < 0.9;
        if (n !== narrow) {
          narrow = n;
          layout();
          (geo.getAttribute("aGrid") as THREE.BufferAttribute).needsUpdate = true;
        }
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      const mouse = new THREE.Vector2(9, 9);
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, 1 - ((e.clientY - r.top) / r.height) * 2);
      };
      const onLeave = () => mouse.set(9, 9);
      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerleave", onLeave);

      let p = still ? 1 : progress.current;
      const clock = new THREE.Clock();
      const draw = (dt: number) => {
        const target = still ? 1 : progress.current;
        p += (target - p) * (1 - Math.pow(0.002, dt)); // smooth the scrub
        const a = THREE.MathUtils.clamp((p - 0.12) / 0.36, 0, 1);
        const b = THREE.MathUtils.clamp((p - 0.6) / 0.32, 0, 1);
        uniforms.uA.value = a;
        uniforms.uShow.value = THREE.MathUtils.smoothstep(p, 0.05, 0.17);
        uniforms.uB.value = b;
        uniforms.uTime.value += dt;
        uniforms.uMouse.value.lerp(mouse, 1 - Math.pow(0.0005, dt));
        // camera: close on the face, back for the ideas, settle for the systems
        const faceZ = cam.aspect < 0.9 ? 7.2 : 5.4;
        const ideaZ = 8.6;
        // short phones (iPhone SE and the like): pull back a little and lift the cubes clear of the caption
        const short = cam.aspect < 0.9 && el.clientHeight < 640;
        const gridZ = short ? 9.2 : cam.aspect < 0.9 ? 8.2 : 7.4;
        cam.position.z = THREE.MathUtils.lerp(THREE.MathUtils.lerp(faceZ, ideaZ, a), gridZ, b);
        cam.position.y = short ? -0.75 * b : 0;
        pts.rotation.y = a * (1 - b) * (0.5 + uniforms.uTime.value * 0.06) + b * Math.sin(uniforms.uTime.value * 0.35) * 0.35;
        pts.rotation.x = a * (1 - b) * 0.35 + b * 0.18;
        renderer.render(scene, cam);

        // keep the project labels under their lattices
        if (labels?.current.length) {
          pts.updateMatrixWorld();
          for (let c = 0; c < 5; c++) {
            const lab = labels.current[c];
            if (!lab) continue;
            const [cx, cy, s] = cubeAt(c, narrow);
            const v = new THREE.Vector3(cx, cy - s * 0.5 - (narrow ? 0.16 : 0.22), 0).applyMatrix4(pts.matrixWorld).project(cam);
            const x = (v.x * 0.5 + 0.5) * el.clientWidth;
            const y = (-v.y * 0.5 + 0.5) * el.clientHeight;
            const show = b > 0.85 ? (b - 0.85) / 0.15 : 0;
            lab.style.transform = `translate(${x - lab.offsetWidth / 2}px, ${y}px)`;
            lab.style.opacity = String(show);
            lab.style.pointerEvents = show > 0.6 ? "auto" : "none";
          }
        }
      };

      let raf = 0;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min(clock.getDelta(), 0.05);
        if (!activeRef.current || document.hidden) return;
        draw(dt);
      };
      if (still) draw(0.016);
      else raf = requestAnimationFrame(loop);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        renderer.dispose();
        geo.dispose();
        mat.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [progress, still, labels]);

  return <div ref={host} aria-hidden className="absolute inset-0" />;
}

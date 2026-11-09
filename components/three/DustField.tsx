"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ui } from "@/lib/store";

/**
 * Pencil dust behind the whole page. Thousands of faint graphite (and a few amber) specks drift
 * slowly; the cursor pushes them aside and leaves a short swirling wake, and they slide with
 * the scroll at a slower rate than the content, which gives the paper some depth.
 * Everything is computed in the vertex shader, so it costs almost nothing per frame.
 */
const vert = /* glsl */ `
  uniform float uTime;
  uniform vec2  uRes;     // css px
  uniform vec2  uMouse;   // css px, eased
  uniform vec2  uTrail;   // css px, eased more slowly: the wake
  uniform float uForce;   // 0..1, how fast the cursor is moving
  uniform float uScroll;  // css px
  uniform float uField;   // height of the repeating field, css px
  uniform float uDpr;
  attribute vec3 aSeed;   // x, y in [0,1], size/variation
  attribute float aAmber;
  varying float vAlpha;
  varying float vAmber;

  void main() {
    // base position, scrolled at 35% of page speed and wrapped
    vec2 p = vec2(aSeed.x * uRes.x, mod(aSeed.y * uField - uScroll * 0.35, uField) - (uField - uRes.y) * 0.5);
    // slow drift
    float t = uTime * 0.12 + aSeed.z * 6.2831;
    p += vec2(sin(t + p.y * 0.004), cos(t * 0.8 + p.x * 0.003)) * 6.0;

    // cursor field: push away, with a little swirl
    vec2 d = p - uMouse;
    float r = length(d);
    float R = 150.0;
    float f = smoothstep(R, 0.0, r);
    vec2 n = r > 0.001 ? d / r : vec2(0.0);
    p += n * f * (28.0 + 40.0 * uForce) + vec2(-n.y, n.x) * f * 18.0 * uForce;

    // the wake left behind
    vec2 dw = p - uTrail;
    float rw = length(dw);
    float fw = smoothstep(R * 0.8, 0.0, rw) * uForce;
    p += (rw > 0.001 ? dw / rw : vec2(0.0)) * fw * 22.0;

    vec2 ndc = vec2(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0);
    gl_Position = vec4(ndc, 0.0, 1.0);
    gl_PointSize = (1.2 + aSeed.z * 1.8 + f * 1.2) * uDpr;
    vAlpha = (0.10 + aSeed.z * 0.14) + f * 0.22;
    vAmber = aAmber;
  }
`;

const frag = /* glsl */ `
  varying float vAlpha;
  varying float vAmber;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float m = smoothstep(0.5, 0.2, length(c));
    vec3 graphite = vec3(0.11, 0.10, 0.086);
    vec3 amber = vec3(0.85, 0.52, 0.12);
    gl_FragColor = vec4(mix(graphite, amber, vAmber), m * vAlpha * (vAmber > 0.5 ? 1.6 : 1.0));
  }
`;

export default function DustField() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.5);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      return; // no WebGL: the paper just stays still
    }
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%";

    const N = coarse ? 900 : 3200;
    const seeds = new Float32Array(N * 3);
    const amber = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      seeds.set([Math.random(), Math.random(), Math.random()], i * 3);
      amber[i] = Math.random() < 0.07 ? 1 : 0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));
    geo.setAttribute("aAmber", new THREE.BufferAttribute(amber, 1));

    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(-9999, -9999) },
      uTrail: { value: new THREE.Vector2(-9999, -9999) },
      uForce: { value: 0 },
      uScroll: { value: 0 },
      uField: { value: 2000 },
      uDpr: { value: dpr },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, transparent: true, depthTest: false, depthWrite: false });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(points);
    const cam = new THREE.Camera();

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w, h);
      uniforms.uField.value = h * 2.2;
    };
    resize();
    window.addEventListener("resize", resize);

    // pointer: target, eased position, slower trail, and a speed-based force
    const target = new THREE.Vector2(-9999, -9999);
    let last = { x: 0, y: 0, t: performance.now() };
    let speed = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(16, now - last.t);
      const v = Math.hypot(e.clientX - last.x, e.clientY - last.y) / dt; // px per ms
      speed = Math.max(speed, Math.min(1, v / 1.6));
      last = { x: e.clientX, y: e.clientY, t: now };
      if (target.x < -9000) {
        uniforms.uMouse.value.set(e.clientX, e.clientY);
        uniforms.uTrail.value.set(e.clientX, e.clientY);
      }
      target.set(e.clientX, e.clientY);
    };
    const onLeave = () => (speed = 0);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    // the paper is hidden behind the scroll film's dark screen and behind full-screen panels;
    // don't draw dust nobody can see
    const film = document.getElementById("film");
    const covered = () => {
      const s = ui.get();
      if (s.room || s.resumeOpen || (coarse && s.assistantOpen)) return true;
      if (!film) return false;
      const r = film.getBoundingClientRect();
      return r.top <= 0 && r.bottom >= window.innerHeight;
    };

    let raf = 0;
    let odd = false;
    const clock = new THREE.Clock();
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      // phones: 30 frames a second is plenty for slow-drifting dust
      if (coarse && (odd = !odd)) return;
      if (covered()) {
        clock.getDelta();
        return;
      }
      const dt = Math.min(clock.getDelta(), 0.05);
      uniforms.uTime.value += dt;
      uniforms.uScroll.value = window.scrollY;
      uniforms.uMouse.value.lerp(target, 1 - Math.pow(0.0008, dt));
      uniforms.uTrail.value.lerp(uniforms.uMouse.value, 1 - Math.pow(0.05, dt));
      speed *= Math.pow(0.12, dt);
      uniforms.uForce.value += (speed - uniforms.uForce.value) * Math.min(1, dt * 6);
      renderer.render(scene, cam);
    };

    if (reduced) {
      renderer.render(scene, cam); // one still frame
      const still = () => {
        uniforms.uScroll.value = window.scrollY;
        renderer.render(scene, cam);
      };
      window.addEventListener("scroll", still, { passive: true });
      return () => {
        window.removeEventListener("scroll", still);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", onLeave);
        renderer.dispose();
        geo.dispose();
        mat.dispose();
        renderer.domElement.remove();
      };
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}

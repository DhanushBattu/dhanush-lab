"use client";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Doll, DollLights, type WaveRef } from "./Doll";

export type NodeSpec = { id: string; pos: [number, number, number]; outer: boolean };

type Props = {
  nodes: NodeSpec[];
  labels: React.MutableRefObject<(HTMLElement | null)[]>;
  center: React.MutableRefObject<HTMLElement | null>;
  selected: React.MutableRefObject<number>;
  wave: WaveRef;
  active: boolean;
  low: boolean;
};

const lineVert = /* glsl */ `
  attribute float aHot; attribute float aT;
  uniform float uSel; uniform float uTime;
  varying float vA;
  void main(){
    float hot = step(abs(aHot - uSel), 0.1);
    // a pulse travels outward along the selected link
    float pulse = hot * smoothstep(0.15, 0.0, abs(fract(uTime*0.6) - aT));
    vA = 0.10 + hot*0.45 + pulse*0.6;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }
`;
const lineFrag = /* glsl */ `
  varying float vA;
  void main(){ gl_FragColor = vec4(vec3(0.43,0.78,0.70)*vA, vA); }
`;

function Scene({ nodes, labels, center, selected, wave, low }: Omit<Props, "active">) {
  const look = useRef({ x: 0, y: 0 });
  const group = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  // links: centre → every node (subdivided so a pulse can travel) + nearest-neighbour mesh
  const { lines, dust, nodeGeo } = useMemo(() => {
    const pos: number[] = [];
    const hot: number[] = [];
    const tt: number[] = [];
    const SEG = 12;
    nodes.forEach((n, i) => {
      for (let s = 0; s < SEG; s++) {
        const a = s / SEG, b = (s + 1) / SEG;
        pos.push(n.pos[0] * a, n.pos[1] * a, n.pos[2] * a, n.pos[0] * b, n.pos[1] * b, n.pos[2] * b);
        hot.push(i, i);
        tt.push(a, b);
      }
    });
    // neighbour links
    nodes.forEach((n, i) => {
      const v = new THREE.Vector3(...n.pos);
      nodes
        .map((m, j) => ({ j, d: v.distanceTo(new THREE.Vector3(...m.pos)) }))
        .filter((x) => x.j > i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .forEach(({ j }) => {
          pos.push(...n.pos, ...nodes[j].pos);
          hot.push(-5, -5);
          tt.push(0, 0);
        });
    });
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    lg.setAttribute("aHot", new THREE.Float32BufferAttribute(hot, 1));
    lg.setAttribute("aT", new THREE.Float32BufferAttribute(tt, 1));

    const D = low ? 250 : 700;
    const dp = new Float32Array(D * 3);
    for (let i = 0; i < D; i++) {
      const r = 1.5 + Math.random() * 3.2;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      dp.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.7, r * Math.sin(ph) * Math.sin(th)], i * 3);
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));

    const ng = new THREE.BufferGeometry();
    ng.setAttribute("position", new THREE.Float32BufferAttribute(nodes.flatMap((n) => n.pos).concat([0, 0, 0]), 3));
    return { lines: lg, dust: dg, nodeGeo: ng };
  }, [nodes, low]);

  const lineMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uSel: { value: -1 }, uTime: { value: 0 } },
        vertexShader: lineVert,
        fragmentShader: lineFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const v = useMemo(() => new THREE.Vector3(), []);

  // pull the camera back on narrow screens so every label stays inside the frame
  useEffect(() => {
    camera.position.z = size.width < 520 ? 12.5 : size.width < 800 ? 10 : 8.6;
    camera.updateProjectionMatrix();
  }, [camera, size.width]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const p = state.pointer;
    look.current.x = p.x;
    look.current.y = p.y;
    mouse.current.x += (p.x - mouse.current.x) * Math.min(1, dt * 3);
    mouse.current.y += (p.y - mouse.current.y) * Math.min(1, dt * 3);
    g.rotation.y += dt * 0.06;
    g.rotation.x = 0.18 + mouse.current.y * 0.15;
    g.position.x = mouse.current.x * 0.15;
    lineMat.uniforms.uSel.value = selected.current;
    lineMat.uniforms.uTime.value = state.clock.elapsedTime;
    g.updateMatrixWorld();

    // project each node to the DOM overlay
    nodes.forEach((n, i) => {
      const el = labels.current[i];
      if (!el) return;
      v.set(...n.pos).applyMatrix4(g.matrixWorld);
      const depth = v.z; // toward camera = larger
      v.project(camera);
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      const near = THREE.MathUtils.clamp((depth + 2.6) / 5.2, 0, 1);
      const isSel = selected.current === i;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(0.78 + near * 0.32).toFixed(3)})`;
      el.style.opacity = isSel ? "1" : (0.28 + near * (n.outer ? 0.45 : 0.72)).toFixed(3);
      el.style.zIndex = String(Math.round(near * 100));
    });
    if (center.current) {
      v.set(0, 0.15, 0.4).project(camera);
      center.current.style.transform = `translate3d(${((v.x * 0.5 + 0.5) * size.width).toFixed(1)}px, ${((-v.y * 0.5 + 0.5) * size.height).toFixed(1)}px, 0) translate(-50%, -50%)`;
    }
  });

  return (
    <>
    {/* D-01 sits at the centre of the constellation, facing the visitor */}
    <DollLights />
    <group scale={0.62} position={[0, 0.05, 0.4]}>
      <Doll look={look} wave={wave} />
    </group>
    <group ref={group}>
      <lineSegments geometry={lines} material={lineMat} />
      <points geometry={nodeGeo}>
        <pointsMaterial size={0.07} color="#f4b45c" transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <points geometry={dust}>
        <pointsMaterial size={0.018} color="#ffffff" transparent opacity={0.35} depthWrite={false} />
      </points>
    </group>
    </>
  );
}

export default function ConstellationScene(props: Props) {
  return (
    <Canvas
      className="!absolute inset-0"
      frameloop={props.active ? "always" : "never"}
      dpr={[1, props.low ? 1.5 : 1.75]}
      camera={{ fov: 40, position: [0, 0, 8.6] }}
      gl={{ antialias: true, alpha: true }}
      flat
      aria-hidden
    >
      <Scene {...props} />
    </Canvas>
  );
}

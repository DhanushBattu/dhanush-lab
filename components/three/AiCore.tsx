"use client";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

/** The lab's "AI core": a wireframe icosahedron with an inner octahedron and an orbiting particle ring. */
function Core({ low }: { low: boolean }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Points>(null);

  const ringGeo = useMemo(() => {
    const n = low ? 90 : 180;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 1.75 + (Math.random() - 0.5) * 0.12;
      pos.set([Math.cos(a) * r, (Math.random() - 0.5) * 0.06, Math.sin(a) * r], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [low]);

  useFrame((state, dt) => {
    const p = state.pointer;
    if (group.current) {
      group.current.rotation.y += dt * 0.12;
      group.current.rotation.x += (p.y * 0.35 - group.current.rotation.x) * 0.05;
      group.current.rotation.z += (-(p.x * 0.25) - group.current.rotation.z) * 0.05;
    }
    if (inner.current) inner.current.rotation.y -= dt * 0.3;
    if (ring.current) ring.current.rotation.y -= dt * 0.05;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshBasicMaterial color="#0e6b5b" wireframe transparent opacity={0.7} />
      </mesh>
      <mesh ref={inner}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshBasicMaterial color="#94500a" wireframe transparent opacity={0.8} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#f0a038" />
      </mesh>
      <points ref={ring} geometry={ringGeo} rotation={[0.35, 0, 0.15]}>
        <pointsMaterial size={0.032} color="#1c1a16" transparent opacity={0.6} depthWrite={false} />
      </points>
    </group>
  );
}

export default function AiCore({ active, low }: { active: boolean; low: boolean }) {
  return (
    <Canvas
      className="!absolute inset-0"
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ fov: 35, position: [0, 0, 6] }}
      gl={{ alpha: true, antialias: true }}
      flat
      aria-hidden
    >
      <Core low={low} />
    </Canvas>
  );
}

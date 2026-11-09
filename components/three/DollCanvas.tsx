"use client";
import { Canvas } from "@react-three/fiber";
import { Doll, DollLights, type LookRef, type WaveRef } from "./Doll";

/** A small, self-contained canvas that renders the D-01 doll. */
export default function DollCanvas({ look, wave, active = true, zoom = 1 }: { look: LookRef; wave?: WaveRef; active?: boolean; zoom?: number }) {
  return (
    <Canvas
      className="!absolute inset-0 !pointer-events-none"
      frameloop={active ? "always" : "never"}
      dpr={[1, 2]}
      camera={{ fov: 30, position: [0, 0.15, 5.6 / zoom] }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <DollLights />
      <Doll look={look} wave={wave} />
    </Canvas>
  );
}

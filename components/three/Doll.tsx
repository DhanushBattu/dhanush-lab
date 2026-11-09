"use client";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

/**
 * "D-01" — an original chibi lab-assistant doll, modelled from primitives (no external model files).
 * Messy dark hair, big glossy eyes, a moustache, holo-goggles pushed up on the forehead,
 * a navy hoodie with a glowing chest core, floating on a hover ring.
 *
 * `look` is a shared ref (-1..1 in x/y) the head turns toward. `wave` raises the right arm.
 */
export type LookRef = React.MutableRefObject<{ x: number; y: number }>;
export type WaveRef = React.MutableRefObject<boolean>;

const SKIN = "#c48a5e";
const SKIN_DARK = "#a8704a";
const HAIR = "#15131a";
const HOODIE = "#2b3d63";
const METAL = "#394154";

export function Doll({ look, wave }: { look: LookRef; wave?: WaveRef }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.MeshBasicMaterial>(null);
  const s = useRef({ lx: 0, ly: 0, arm: -0.35, nextBlink: 2.5, blinkT: -1 });

  const m = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.55 }),
      skinDark: new THREE.MeshStandardMaterial({ color: SKIN_DARK, roughness: 0.6 }),
      hair: new THREE.MeshStandardMaterial({ color: HAIR, roughness: 0.75 }),
      hoodie: new THREE.MeshStandardMaterial({ color: HOODIE, roughness: 0.6, metalness: 0.05 }),
      eye: new THREE.MeshStandardMaterial({ color: "#0a0c12", roughness: 0.08, metalness: 0.2 }),
      iris: new THREE.MeshBasicMaterial({ color: "#3d7bff" }),
      white: new THREE.MeshBasicMaterial({ color: "#ffffff" }),
      dark: new THREE.MeshStandardMaterial({ color: "#1c1216", roughness: 0.6 }),
      metal: new THREE.MeshStandardMaterial({ color: METAL, roughness: 0.3, metalness: 0.8 }),
      lens: new THREE.MeshStandardMaterial({ color: "#6ea0ff", emissive: "#2f63ff", emissiveIntensity: 1.1, roughness: 0.15, metalness: 0.3 }),
      glow: new THREE.MeshBasicMaterial({ color: "#6f9dff", transparent: true, opacity: 0.9 }),
      halo: new THREE.MeshBasicMaterial({ color: "#3d7bff", transparent: true, opacity: 0.16, depthWrite: false }),
    }),
    []
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const st = s.current;
    const k = Math.min(1, dt * 5);
    st.lx += (look.current.x - st.lx) * k;
    st.ly += (look.current.y - st.ly) * k;

    if (root.current) root.current.position.y = Math.sin(t * 1.6) * 0.06;
    if (body.current) body.current.rotation.y = st.lx * 0.3 + Math.sin(t * 0.5) * 0.06;
    if (head.current) {
      head.current.rotation.y = st.lx * 0.5;
      head.current.rotation.x = -st.ly * 0.28 + Math.sin(t * 1.2) * 0.025;
      head.current.rotation.z = Math.sin(t * 0.8) * 0.04 - st.lx * 0.06;
    }
    // blink
    if (t > st.nextBlink && st.blinkT < 0) st.blinkT = 0;
    if (st.blinkT >= 0) {
      st.blinkT += dt;
      const p = st.blinkT / 0.16;
      if (eyes.current) eyes.current.scale.y = p < 1 ? Math.max(0.1, Math.abs(1 - 2 * p)) : 1;
      if (p >= 1) {
        st.blinkT = -1;
        st.nextBlink = t + 2.2 + Math.random() * 3;
      }
    }
    // wave
    const waving = wave?.current ?? false;
    const target = waving ? 2.35 + Math.sin(t * 10) * 0.35 : -0.35 + Math.sin(t * 1.6) * 0.05;
    st.arm += (target - st.arm) * Math.min(1, dt * 8);
    if (armR.current) armR.current.rotation.z = st.arm;
    if (armL.current) armL.current.rotation.z = 0.35 - Math.sin(t * 1.6) * 0.05;
    if (ring.current) {
      const sc = 1 + Math.sin(t * 3) * 0.05;
      ring.current.scale.set(sc, sc, sc);
    }
    if (core.current) core.current.opacity = 0.75 + Math.sin(t * 3.2) * 0.25;
  });

  return (
    <group ref={root}>
      {/* hover platform */}
      <mesh ref={ring} position={[0, -1.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.glow}>
        <torusGeometry args={[0.42, 0.022, 12, 64]} />
      </mesh>
      <mesh position={[0, -1.13, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.halo}>
        <circleGeometry args={[0.62, 48]} />
      </mesh>

      <group ref={body}>
        {/* hoodie */}
        <mesh position={[0, -0.5, 0]} scale={[1, 1, 0.82]} material={m.hoodie}>
          <capsuleGeometry args={[0.36, 0.3, 8, 24]} />
        </mesh>
        {/* hood / collar */}
        <mesh position={[0, -0.15, -0.04]} rotation={[Math.PI / 2 - 0.25, 0, 0]} material={m.hoodie}>
          <torusGeometry args={[0.27, 0.09, 12, 32]} />
        </mesh>
        {/* glowing chest core (hexagon) + hem line */}
        <mesh position={[0, -0.42, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.03, 6]} />
          <meshBasicMaterial ref={core} color="#8fb0ff" transparent />
        </mesh>
        <mesh position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.82, 1]} material={m.glow}>
          <torusGeometry args={[0.345, 0.012, 8, 48]} />
        </mesh>
        {/* arms */}
        <group ref={armR} position={[0.34, -0.3, 0]}>
          <mesh position={[0, -0.2, 0]} material={m.hoodie}>
            <capsuleGeometry args={[0.09, 0.2, 6, 12]} />
          </mesh>
          <mesh position={[0, -0.4, 0]} material={m.skin}>
            <sphereGeometry args={[0.1, 16, 16]} />
          </mesh>
        </group>
        <group ref={armL} position={[-0.34, -0.3, 0]}>
          <mesh position={[0, -0.2, 0]} material={m.hoodie}>
            <capsuleGeometry args={[0.09, 0.2, 6, 12]} />
          </mesh>
          <mesh position={[0, -0.4, 0]} material={m.skin}>
            <sphereGeometry args={[0.1, 16, 16]} />
          </mesh>
        </group>

        {/* ---------------- head ---------------- */}
        <group ref={head} position={[0, 0.5, 0]}>
          <mesh scale={[1.04, 0.96, 0.96]} material={m.skin}>
            <sphereGeometry args={[0.62, 40, 32]} />
          </mesh>
          {/* ears */}
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[0.63 * sx, -0.04, 0]} scale={[0.45, 1, 0.8]} material={m.skinDark}>
              <sphereGeometry args={[0.12, 16, 16]} />
            </mesh>
          ))}

          {/* hair: back/top cap, tilted back so the face stays open */}
          <mesh rotation={[-0.42, 0, 0]} position={[0, 0.03, -0.02]} scale={[1.08, 1.02, 1.06]} material={m.hair}>
            <sphereGeometry args={[0.64, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.46]} />
          </mesh>
          {/* messy fringe swept to one side */}
          {[
            [-0.34, 0.4, 0.42, 0.9, 0.5],
            [-0.14, 0.46, 0.46, 1.1, 0.25],
            [0.08, 0.47, 0.45, 1.25, 0.05],
            [0.28, 0.42, 0.42, 1.35, -0.2],
            [0.44, 0.3, 0.32, 1.5, -0.45],
          ].map(([x, y, z, rz, ry], i) => (
            <mesh key={i} position={[x, y, z]} rotation={[0.6, ry, rz]} material={m.hair}>
              <coneGeometry args={[0.15, 0.42, 10]} />
            </mesh>
          ))}
          {/* volume on top */}
          {[
            [-0.25, 0.58, 0.05, 0.24],
            [0.12, 0.64, 0.08, 0.26],
            [0.38, 0.5, -0.02, 0.2],
            [-0.05, 0.62, -0.25, 0.25],
          ].map(([x, y, z, r], i) => (
            <mesh key={i} position={[x, y, z]} material={m.hair}>
              <sphereGeometry args={[r, 20, 16]} />
            </mesh>
          ))}

          {/* holo-goggles pushed up on the forehead */}
          <mesh position={[0, 0.3, -0.02]} rotation={[Math.PI / 2 - 0.5, 0, 0]} scale={[1.07, 1, 1]} material={m.metal}>
            <torusGeometry args={[0.6, 0.025, 8, 48]} />
          </mesh>
          {[-1, 1].map((sx) => (
            <group key={sx} position={[0.2 * sx, 0.36, 0.47]} rotation={[-0.55, 0.28 * sx, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} material={m.metal}>
                <cylinderGeometry args={[0.13, 0.13, 0.08, 24]} />
              </mesh>
              <mesh position={[0, 0, 0.045]} material={m.lens}>
                <circleGeometry args={[0.1, 24]} />
              </mesh>
            </group>
          ))}

          {/* eyes */}
          <group ref={eyes} position={[0, -0.02, 0]}>
            {[-1, 1].map((sx) => (
              <group key={sx} position={[0.21 * sx, 0, 0.53]}>
                <mesh scale={[0.85, 1.15, 0.5]} material={m.eye}>
                  <sphereGeometry args={[0.1, 20, 20]} />
                </mesh>
                <mesh position={[0, -0.03, 0.045]} rotation={[0, 0, 0]} material={m.iris}>
                  <torusGeometry args={[0.045, 0.008, 6, 20]} />
                </mesh>
                <mesh position={[0.03, 0.045, 0.05]} material={m.white}>
                  <sphereGeometry args={[0.024, 10, 10]} />
                </mesh>
              </group>
            ))}
          </group>
          {/* brows */}
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[0.21 * sx, 0.16, 0.555]} rotation={[0, 0.35 * sx, Math.PI / 2 + 0.14 * sx]} material={m.hair}>
              <capsuleGeometry args={[0.022, 0.12, 4, 8]} />
            </mesh>
          ))}
          {/* nose */}
          <mesh position={[0, -0.12, 0.6]} material={m.skinDark}>
            <sphereGeometry args={[0.045, 12, 12]} />
          </mesh>
          {/* moustache */}
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[0.06 * sx, -0.21, 0.56]} rotation={[0, 0, (Math.PI / 2 + 0.35) * sx]} material={m.hair}>
              <capsuleGeometry args={[0.02, 0.08, 4, 8]} />
            </mesh>
          ))}
          {/* smile */}
          <mesh position={[0, -0.27, 0.54]} rotation={[0.25, 0, Math.PI]} material={m.dark}>
            <torusGeometry args={[0.06, 0.013, 6, 16, Math.PI]} />
          </mesh>
          {/* cheeks */}
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[0.33 * sx, -0.14, 0.47]} scale={[1, 0.6, 0.3]}>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshBasicMaterial color="#e08a74" transparent opacity={0.35} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

/** Soft studio lighting with a blue rim, shared by every doll scene. */
export function DollLights() {
  return (
    <>
      <hemisphereLight args={["#cfe0ff", "#1a1826", 0.9]} />
      <directionalLight position={[2.5, 3, 4]} intensity={1.6} />
      <pointLight position={[-2.2, 1.2, -1.5]} intensity={9} color="#3d7bff" distance={8} />
      <pointLight position={[2.2, -0.5, 1.5]} intensity={2} color="#8fb0ff" distance={6} />
    </>
  );
}

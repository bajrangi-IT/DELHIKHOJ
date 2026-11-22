"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Dust({ count = 420 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 16;
      a[i * 3 + 1] = (Math.random() - 0.5) * 9;
      a[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return a;
  }, [count]);
  useFrame((state, dt) => {
    const p = ref.current;
    if (!p) return;
    p.rotation.y += dt * 0.015;
    p.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    const s = Math.min(window.scrollY / window.innerHeight, 1);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 6 - s * 3, 0.06);
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.pointer.x * 0.5, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.pointer.y * 0.3, 0.04);
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#C69A50" transparent opacity={0.75} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function Bird({ seed }: { seed: number }) {
  const g = useRef<THREE.Group>(null);
  const l = useRef<THREE.Mesh>(null);
  const r = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.35 + seed * 3;
    if (!g.current) return;
    g.current.position.x = ((t * 1.2) % 18) - 9;
    g.current.position.y = 1.6 + Math.sin(t * 2 + seed) * 0.3 + seed * 0.25;
    g.current.position.z = -2 - seed * 0.8;
    const flap = Math.sin(state.clock.elapsedTime * 7 + seed * 5) * 0.5;
    if (l.current) l.current.rotation.z = 0.3 + flap;
    if (r.current) r.current.rotation.z = -0.3 - flap;
  });
  return (
    <group ref={g} scale={0.28}>
      <mesh ref={l} position={[-0.5, 0, 0]}><planeGeometry args={[1, 0.18]} /><meshBasicMaterial color="#11100E" side={THREE.DoubleSide} /></mesh>
      <mesh ref={r} position={[0.5, 0, 0]}><planeGeometry args={[1, 0.18]} /><meshBasicMaterial color="#11100E" side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 6], fov: 55 }} gl={{ alpha: true, antialias: false, powerPreference: "low-power" }} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <Dust />
      {[0, 1, 2, 3].map((i) => <Bird key={i} seed={i} />)}
    </Canvas>
  );
}

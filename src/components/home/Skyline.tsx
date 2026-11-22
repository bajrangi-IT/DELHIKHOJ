"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSectionProgress } from "@/lib/useSectionProgress";
import { isLowEnd, useMotionAllowed, webglSupported } from "@/lib/motion";

const LEN = 220;
const landmarks = [
  { z: -60, label: "Old Delhi — Jama Masjid & Red Fort side" },
  { z: -120, label: "Lutyens' Delhi — India Gate & Rajpath" },
  { z: -180, label: "South Delhi — Qutub & Mehrauli ridge" },
];

function City({ progress }: { progress: { current: number } }) {
  const { camera } = useThree();
  const mesh = useRef<THREE.InstancedMesh>(null);

  const { matrices, colors } = useMemo(() => {
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 150; i++) {
      const z = -i * 1.45 - 4;
      const side = rnd() > 0.5 ? 1 : -1;
      const x = side * (4.5 + rnd() * 7);
      const h = 2 + rnd() * 9;
      const w = 2 + rnd() * 3;
      m.makeScale(w, h, w);
      m.setPosition(x, h / 2, z);
      mats.push(m.clone());
      const warm = rnd() > 0.5;
      c.set(warm ? "#8a6a4a" : "#4d4a45");
      cols.push(c.clone());
    }
    return { matrices: mats, colors: cols };
  }, []);

  useEffect(() => {
    const inst = mesh.current;
    if (!inst) return;
    matrices.forEach((mat, i) => inst.setMatrixAt(i, mat));
    colors.forEach((c, i) => inst.setColorAt(i, c));
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  }, [matrices, colors]);

  useFrame(() => {
    const z = 8 - progress.current * (LEN - 14);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, z, 0.06);
    camera.position.y = 6.5 + Math.sin(progress.current * Math.PI * 3) * 0.8;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(progress.current * Math.PI * 2) * 2.2, 0.05);
    camera.lookAt(camera.position.x * 0.6, 3, camera.position.z - 12);
  });

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -LEN / 2]}>
        <planeGeometry args={[80, LEN]} />
        <meshStandardMaterial color="#191713" roughness={1} />
      </mesh>
      {/* river */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0.02, -LEN / 2]}>
        <planeGeometry args={[5, LEN]} />
        <meshStandardMaterial color="#12333a" roughness={0.3} metalness={0.4} />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined, undefined, matrices.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.9} emissive="#c69a50" emissiveIntensity={0.12} />
      </instancedMesh>
      {/* landmark: dome at -120 */}
      <group position={[0, 0, -120]}>
        <mesh position={[0, 2, 0]}><boxGeometry args={[4, 4, 4]} /><meshStandardMaterial color="#9C4A3C" roughness={0.9} /></mesh>
        <mesh position={[0, 5.2, 0]}><sphereGeometry args={[2.4, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#F3EBDD" roughness={0.5} /></mesh>
      </group>
      {/* landmark: minar at -60 */}
      <group position={[0, 0, -60]}>
        <mesh position={[0, 6, 0]}><cylinderGeometry args={[0.8, 1.2, 12, 10]} /><meshStandardMaterial color="#C9A77B" roughness={0.9} /></mesh>
      </group>
      {/* landmark: arch at -180 */}
      <group position={[0, 0, -180]}>
        <mesh position={[-2.4, 3.4, 0]}><boxGeometry args={[1.4, 6.8, 1.4]} /><meshStandardMaterial color="#C9A77B" /></mesh>
        <mesh position={[2.4, 3.4, 0]}><boxGeometry args={[1.4, 6.8, 1.4]} /><meshStandardMaterial color="#C9A77B" /></mesh>
        <mesh position={[0, 7, 0]}><boxGeometry args={[6.2, 1.4, 1.4]} /><meshStandardMaterial color="#C9A77B" /></mesh>
      </group>
    </>
  );
}

export default function Skyline() {
  const motion = useMotionAllowed();
  const [gl, setGl] = useState<boolean | null>(null);
  useEffect(() => setGl(webglSupported() && !isLowEnd()), []);
  const enabled = !!motion && !!gl;
  const { sectionRef, progressRef, progress } = useSectionProgress(enabled);
  const idx = Math.max(0, landmarks.findIndex((l) => l.z > -8 + progress * (LEN - 14) - 40) - 1);
  const cur = landmarks[Math.min(landmarks.length - 1, Math.max(0, idx))];

  if (motion === null || gl === null) return <div className="skeleton mx-auto my-10 h-[70vh] max-w-6xl" aria-label="Loading 3D city" />;
  if (!enabled) return null; // static sections below already carry the content

  return (
    <section ref={sectionRef} className="relative my-10" style={{ height: "380vh" }} aria-label="3D flyover of Delhi's skyline">
      <div className="sticky top-0 h-screen overflow-hidden">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 6.5, 8], fov: 55 }} gl={{ antialias: false, powerPreference: "high-performance" }}>
          <color attach="background" args={["#0d0c0a"]} />
          <fog attach="fog" args={["#0d0c0a", 30, LEN * 0.75]} />
          <hemisphereLight args={["#F3EBDD", "#1a1712", 0.9]} />
          <directionalLight position={[8, 14, 4]} intensity={1.2} color="#FFD9A0" />
          <City progress={progressRef} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70" />
        <div className="absolute inset-x-0 top-24 text-center">
          <p className="eyebrow">Scroll to fly over the city</p>
          <h2 className="font-serif text-4xl sm:text-6xl mt-2">One city, many Delhis</h2>
        </div>
        <div className="absolute inset-x-0 bottom-8 text-center">
          <p key={cur.label} className="font-serif text-2xl text-gold animate-[fadein_.6s_ease]">{cur.label}</p>
          <div className="wrap mt-4"><div className="h-px bg-ivory/15"><div className="h-px bg-gold" style={{ width: `${progress * 100}%` }} /></div></div>
        </div>
      </div>
      <style>{`@keyframes fadein{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}

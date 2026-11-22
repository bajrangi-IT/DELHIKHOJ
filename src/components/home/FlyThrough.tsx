"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSectionProgress } from "@/lib/useSectionProgress";
import { isLowEnd, useMotionAllowed, webglSupported } from "@/lib/motion";
import SmartImage from "@/components/SmartImage";

export type FlyItem = { slug: string; name: string; era: string | null; summary: string; image: string | null };
const GAP = 7;

function Frame({ item, index, texture }: { item: FlyItem; index: number; texture: THREE.Texture | null }) {
  const ref = useRef<THREE.Mesh>(null);
  const aspect = texture?.image ? (texture.image as HTMLImageElement).width / (texture.image as HTMLImageElement).height : 1.5;
  const h = 3.2;
  const x = index % 2 ? 2.7 : -2.7;
  useFrame((s) => {
    if (ref.current) ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.6 + index) * 0.12;
  });
  return (
    <group position={[x, 0, -index * GAP]} rotation={[0, index % 2 ? -0.28 : 0.28, 0]}>
      <mesh position={[0, 0, -0.02]}><planeGeometry args={[h * aspect + 0.12, h + 0.12]} /><meshBasicMaterial color="#C69A50" /></mesh>
      <mesh ref={ref}>
        <planeGeometry args={[h * aspect, h]} />
        <meshBasicMaterial map={texture ?? undefined} color={texture ? "#ffffff" : "#3a2a2a"} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Rig({ items, progress }: { items: FlyItem[]; progress: MutableRefObject<number> }) {
  const loader = useMemo(() => new THREE.TextureLoader(), []);
  const [textures, setTextures] = useState<(THREE.Texture | null)[]>(() => items.map(() => null));
  const { camera } = useThree();

  useEffect(() => {
    let alive = true;
    items.forEach((it, i) => {
      if (!it.image) return;
      loader.load(it.image, (t) => {
        if (!alive) return;
        t.colorSpace = THREE.SRGBColorSpace;
        setTextures((prev) => { const n = [...prev]; n[i] = t; return n; });
      });
    });
    return () => { alive = false; };
  }, [items, loader]);

  useFrame((state) => {
    const total = (items.length - 1) * GAP;
    const targetZ = 5 - progress.current * total;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(progress.current * Math.PI * items.length) * 0.9 + state.pointer.x * 0.4, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, state.pointer.y * 0.25, 0.05);
  });

  return <>{items.map((it, i) => <Frame key={it.slug} item={it} index={i} texture={textures[i]} />)}</>;
}

function Fallback({ items }: { items: FlyItem[] }) {
  return (
    <div className="wrap section">
      <h2 className="h-section">Fly through Delhi's landmarks</h2>
      <ul className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4">
        {items.map((it) => (
          <li key={it.slug} className="w-72 shrink-0 snap-start">
            <Link href={`/destination/${it.slug}`} className="block overflow-hidden rounded-2xl border border-ivory/10 bg-charcoal">
              <SmartImage src={it.image} alt={it.name} className="aspect-[4/3] w-full" />
              <span className="block p-4 font-serif text-xl">{it.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FlyThrough({ items }: { items: FlyItem[] }) {
  const motion = useMotionAllowed();
  const [gl, setGl] = useState<boolean | null>(null);
  useEffect(() => setGl(webglSupported() && !isLowEnd()), []);
  const enabled = !!motion && !!gl;
  const { sectionRef, progressRef, progress } = useSectionProgress(enabled);
  const idx = Math.min(items.length - 1, Math.round(progress * (items.length - 1)));
  const cur = items[idx];

  if (motion === null || gl === null) return <div className="skeleton mx-auto my-20 h-96 max-w-5xl" aria-label="Loading 3D scene" />;
  if (!enabled) return <Fallback items={items} />;

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${items.length * 90 + 100}vh` }} aria-label="3D fly-through of Delhi landmarks">
      <div className="sticky top-0 h-screen overflow-hidden bg-ink">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <color attach="background" args={["#11100E"]} />
          <fog attach="fog" args={["#11100E", 6, 22]} />
          <Rig items={items} progress={progressRef} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
        <div className="absolute inset-x-0 top-24 text-center">
          <p className="eyebrow">Fly through Delhi</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 pb-10">
          <div className="wrap flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div key={cur.slug} className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-gold">{String(idx + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")} · {cur.era}</p>
              <h3 className="mt-2 font-serif text-4xl sm:text-5xl">{cur.name}</h3>
              <p className="mt-2 line-clamp-2 text-ivory/70">{cur.summary}</p>
            </div>
            <Link href={`/destination/${cur.slug}`} className="btn btn-gold pointer-events-auto shrink-0">Open guide</Link>
          </div>
          <div className="wrap mt-5"><div className="h-px bg-ivory/15"><div className="h-px bg-gold" style={{ width: `${progress * 100}%` }} /></div></div>
        </div>
      </div>
    </section>
  );
}

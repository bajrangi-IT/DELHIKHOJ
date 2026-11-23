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

function Frame({ item, index }: { item: FlyItem; index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const { viewport } = useThree();

  useEffect(() => {
    if (!item.image) return;
    let active = true;
    const img = new Image();
    if (item.image.startsWith("http")) {
      img.crossOrigin = "anonymous";
    }
    const onLoad = () => {
      if (!active) return;
      const tex = new THREE.Texture(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      setTexture(tex);
    };
    img.onload = onLoad;
    img.src = item.image;
    if (img.complete && img.naturalWidth > 0) {
      onLoad();
    }
    return () => {
      active = false;
    };
  }, [item.image]);

  useFrame((s) => {
    if (ref.current) ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.6 + index) * 0.12;
  });

  const isNarrow = viewport.width < 6.0;
  const aspect = texture?.image
    ? (texture.image as HTMLImageElement).width / (texture.image as HTMLImageElement).height
    : 1.5;

  // Responsive sizing: On mobile, guarantee the photo never overflows screen width
  const maxMobileW = viewport.width * 0.82;
  const h = isNarrow ? Math.min(1.85, maxMobileW / aspect) : 3.2;
  const w = h * aspect;

  // On mobile: perfectly centered at x=0 and raised to y=0.5 so it never overflows sides or overlaps text
  // On desktop: alternating left and right with cinematic rotation
  const x = isNarrow ? 0 : index % 2 ? 2.6 : -2.6;
  const y = isNarrow ? 0.45 : 0;
  const rotY = isNarrow ? 0 : index % 2 ? -0.25 : 0.25;

  return (
    <group position={[x, y, -index * GAP]} rotation={[0, rotY, 0]}>
      {/* Decorative Golden Border */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[w + (isNarrow ? 0.12 : 0.18), h + (isNarrow ? 0.12 : 0.18)]} />
        <meshBasicMaterial color="#C69A50" />
      </mesh>
      {/* Landmark Photo Plane */}
      <mesh ref={ref}>
        <planeGeometry args={[w, h]} />
        {texture ? (
          <meshBasicMaterial key={texture.uuid} map={texture} toneMapped={false} />
        ) : (
          <meshBasicMaterial color="#221c17" />
        )}
      </mesh>
    </group>
  );
}

function Rig({ items, progress }: { items: FlyItem[]; progress: MutableRefObject<number> }) {
  const { camera, viewport } = useThree();

  useFrame((state) => {
    const isNarrow = viewport.width < 6.0;
    const total = (items.length - 1) * GAP;
    const targetZ = 5 - progress.current * total;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);

    // On mobile, keep camera strictly on center line to avoid throwing landmarks off-screen
    const lateralSway = isNarrow ? 0 : Math.sin(progress.current * Math.PI * items.length) * 0.8;
    const pointerOffset = isNarrow ? 0 : state.pointer.x * 0.35;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, lateralSway + pointerOffset, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, isNarrow ? 0 : state.pointer.y * 0.25, 0.05);
  });

  return <>{items.map((it, i) => <Frame key={it.slug} item={it} index={i} />)}</>;
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
      <div className="sticky top-0 h-[100svh] min-h-[500px] overflow-hidden bg-ink">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <color attach="background" args={["#11100E"]} />
          <fog attach="fog" args={["#11100E", 6, 22]} />
          <Rig items={items} progress={progressRef} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
        <div className="pointer-events-none absolute inset-x-0 top-20 sm:top-24 text-center">
          <p className="eyebrow">Fly through Delhi</p>
          <p className="text-[11px] text-ivory/50 mt-1 hidden sm:block">Scroll to explore Delhi&apos;s monuments</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 pb-6 sm:pb-10 pt-16 bg-gradient-to-t from-ink via-ink/80 to-transparent">
          <div className="wrap flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div key={cur.slug} className="max-w-xl">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-gold">{String(idx + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")} · {cur.era}</p>
              <h3 className="mt-1 font-serif text-2xl sm:text-4xl lg:text-5xl text-ivory font-bold">{cur.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-ivory/80 leading-relaxed">{cur.summary}</p>
            </div>
            <Link href={`/destination/${cur.slug}`} className="btn btn-gold pointer-events-auto shrink-0 !min-h-10 text-xs sm:text-sm px-5">
              Open guide →
            </Link>
          </div>
          <div className="wrap mt-4">
            <div className="h-1 rounded-full bg-ivory/15 overflow-hidden">
              <div className="h-full bg-gold transition-all duration-75" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

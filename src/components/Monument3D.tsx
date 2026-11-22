"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { isLowEnd, useMotionAllowed, webglSupported } from "@/lib/motion";
import SmartImage from "@/components/SmartImage";
import { getMonumentViews, type MonumentViewAngle } from "@/lib/assets";

const GOLD = "#C69A50";
const SANDSTONE = "#8c4a3b";
const MARBLE = "#f0ebe1";

interface Hotspot {
  id: string;
  name: string;
  pos: [number, number, number];
  note: string;
}

const MONUMENT_HOTSPOTS: Record<string, Hotspot[]> = {
  "red-fort": [
    { id: "lahori-gate", name: "Lahori Gate", pos: [0, 1.2, 2.5], note: "Primary ceremonial entrance where India's Prime Minister hoists the national flag on Independence Day." },
    { id: "diwan-i-khas", name: "Diwan-i-Khas", pos: [2.2, 1.5, 0], note: "Hall of Private Audiences featuring famous Pietra dura marble floral inlays and royal Mughal court pavilions." },
    { id: "ramparts", name: "Sandstone Ramparts", pos: [-2.5, 2.2, -1], note: "Massive 2.41 km defensive perimeter walls constructed from red sandstone quarried in Rajasthan." },
  ],
  "qutub-minar": [
    { id: "minaret-balconies", name: "Fluted Balconies", pos: [0, 4.2, 0.8], note: "Intricately carved brackets carrying five tapering tiers of red sandstone and white marble." },
    { id: "iron-pillar", name: "Iron Pillar of Delhi", pos: [2.4, 0.8, 1.5], note: "4th-century metallurgical marvel of Chandragupta II that has resisted rust for over 1,600 years." },
    { id: "quwwat-mosque", name: "Quwwat-ul-Islam", pos: [-2.2, 0.9, -1.2], note: "One of northern India's earliest surviving Islamic monuments, dating to the late 12th century." },
  ],
  "humayuns-tomb": [
    { id: "marble-dome", name: "Marble Double-Dome", pos: [0, 3.8, 0], note: "First high double-dome on the Indian subcontinent, direct architectural precursor to the Taj Mahal." },
    { id: "charbagh", name: "Charbagh Waterways", pos: [0, 0.2, 2.8], note: "Four-quadrant Persian paradise garden representing the four rivers of Jannat." },
    { id: "chhatris", name: "Mughal Chhatris", pos: [2.0, 3.0, 1.8], note: "Elevated domed pavilions blending Persian geometry with Rajasthani architectural craft." },
  ],
  "india-gate": [
    { id: "amar-jawan", name: "Amar Jawan Jyoti", pos: [0, 0.6, 1.2], note: "The Eternal Flame and inverted bayonet dedicated to fallen Indian soldiers since 1971." },
    { id: "arch-inscriptions", name: "Soldier Inscriptions", pos: [0, 3.2, 1.5], note: "Over 13,300 names of Indian soldiers who served in WWI and the Third Anglo-Afghan War." },
    { id: "kartavya-path", name: "Kartavya Path Promenade", pos: [0, 0.1, -3.2], note: "Grand ceremonial avenue leading directly towards Rashtrapati Bhavan." },
  ],
  "lotus-temple": [
    { id: "petals", name: "9 Blooming Petals", pos: [0, 2.5, 1.8], note: "27 free-standing petals arranged in clusters of three, made of white Greek Penteli marble." },
    { id: "ponds", name: "9 Reflection Pools", pos: [2.6, 0.2, 2.0], note: "Turquoise water pools naturally cooling the central 2,500-capacity prayer auditorium." },
  ],
};

function CurvedPhotoStage({
  activeView,
  lighting,
}: {
  activeView: MonumentViewAngle;
  lighting: "day" | "sunset" | "night";
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let active = true;
    const img = new Image();
    if (activeView.url.startsWith("http")) img.crossOrigin = "anonymous";
    img.src = activeView.url;
    img.onload = () => {
      if (!active) return;
      const tex = new THREE.Texture(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      setTexture(tex);
    };
    if (img.complete && img.naturalWidth > 0) {
      const tex = new THREE.Texture(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      setTexture(tex);
    }
    return () => {
      active = false;
    };
  }, [activeView.url]);

  return (
    <group position={[0, 0, 0]}>
      {/* Curved Architectural Backdrop Screen */}
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[5.2, 5.2, 4.4, 32, 1, true, -Math.PI * 0.42, Math.PI * 0.84]} />
        {texture ? (
          <meshBasicMaterial
            key={texture.uuid}
            map={texture}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial color={SANDSTONE} side={THREE.DoubleSide} roughness={0.8} />
        )}
      </mesh>

      {/* Raised Pedestal Base with Sandstone Inlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[5.8, 48]} />
        <meshStandardMaterial
          color={lighting === "night" ? "#141210" : lighting === "sunset" ? "#3a251b" : "#24201c"}
          roughness={0.8}
        />
      </mesh>

      {/* Gold Perimeter Inlay Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <ringGeometry args={[4.8, 5.2, 48]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function HotspotMarker({
  spot,
  active,
  onClick,
}: {
  spot: Hotspot;
  active: boolean;
  onClick: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = spot.pos[1] + Math.sin(state.clock.elapsedTime * 3 + spot.pos[0]) * 0.08;
    }
  });

  return (
    <group ref={ref} position={spot.pos} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Outer Pulse Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.32, 16]} />
        <meshBasicMaterial color={active ? "#10b981" : GOLD} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Center Beacon Orb */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color={active ? "#10b981" : "#ffffff"} />
      </mesh>
      {/* Point Light for Glow */}
      <pointLight color={active ? "#10b981" : GOLD} intensity={1.5} distance={2.5} />
    </group>
  );
}

function OrbitCamera({
  orbitYaw,
  orbitPitch,
  zoom,
  autoRotate = false,
}: {
  orbitYaw: number;
  orbitPitch: number;
  zoom: number;
  autoRotate?: boolean;
}) {
  const { camera } = useThree();
  const autoYawRef = useRef(0);

  useFrame((_, delta) => {
    if (autoRotate) {
      autoYawRef.current += delta * 6;
    }
    const dist = THREE.MathUtils.clamp(zoom, 4.5, 12.0);
    const radYaw = (orbitYaw + autoYawRef.current) * (Math.PI / 180);
    const radPitch = orbitPitch * (Math.PI / 180);

    const x = Math.sin(radYaw) * Math.cos(radPitch) * dist;
    const y = Math.sin(radPitch) * dist + 1.8;
    const z = Math.cos(radYaw) * Math.cos(radPitch) * dist;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, x, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, y, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, z, 0.08);

    camera.lookAt(0, 1.8, 0);
  });

  return null;
}

export default function Monument3D({
  slug,
  name,
  category,
  image,
}: {
  slug: string;
  name: string;
  category: string;
  image: string | null;
}) {
  const motion = useMotionAllowed();
  const [gl, setGl] = useState<boolean | null>(null);
  const [lighting, setLighting] = useState<"day" | "sunset" | "night">("day");
  const [orbitYaw, setOrbitYaw] = useState(0);
  const [orbitPitch, setOrbitPitch] = useState(15);
  const [zoom, setZoom] = useState(7.5);
  const [dragging, setDragging] = useState(false);
  const [lastPointer, setLastPointer] = useState<{ x: number; y: number } | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  const views = useMemo(() => getMonumentViews(slug), [slug]);
  const [activeViewIdx, setActiveViewIdx] = useState(0);
  const currentView = views[activeViewIdx] || views[0];

  const hotspots = useMemo(() => MONUMENT_HOTSPOTS[slug] || [], [slug]);

  useEffect(() => {
    setGl(webglSupported() && !isLowEnd());
  }, []);

  function handlePointerDown(e: React.PointerEvent) {
    setDragging(true);
    setLastPointer({ x: e.clientX, y: e.clientY });
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging || !lastPointer) return;
    const dx = e.clientX - lastPointer.x;
    const dy = e.clientY - lastPointer.y;
    setLastPointer({ x: e.clientX, y: e.clientY });

    setOrbitYaw((yaw) => yaw - dx * 0.4);
    setOrbitPitch((pitch) => THREE.MathUtils.clamp(pitch + dy * 0.3, -5, 60));
  }

  function handlePointerUp() {
    setDragging(false);
    setLastPointer(null);
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => THREE.MathUtils.clamp(z + e.deltaY * 0.005, 4.5, 11));
  }

  if (motion === null || gl === null) {
    return <div className="skeleton aspect-video w-full rounded-2xl" aria-label="Loading 3D view" />;
  }

  if (!gl || !motion) {
    return (
      <div className="space-y-4">
        <SmartImage
          src={currentView.url}
          alt={`Photograph of ${name}`}
          fallbackLabel={name}
          className="aspect-video w-full rounded-2xl border border-ivory/10"
        />
        <div className="flex gap-2">
          {views.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setActiveViewIdx(i)}
              className={`rounded-full px-3 py-1 text-xs border ${
                activeViewIdx === i ? "border-gold text-gold bg-gold/10" : "border-ivory/20 text-ivory/60"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 3D Visualizer Canvas Box */}
      <div
        className="relative h-[340px] sm:h-[460px] md:h-[540px] w-full overflow-hidden rounded-3xl border border-ivory/15 bg-gradient-to-b from-[#161412] via-[#0f0e0c] to-ink shadow-2xl select-none touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      >
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 2.5, 7.5], fov: 48 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <color
            attach="background"
            args={[lighting === "night" ? "#0a0908" : lighting === "sunset" ? "#1a120d" : "#13110f"]}
          />
          <fog
            attach="fog"
            args={[
              lighting === "night" ? "#0a0908" : lighting === "sunset" ? "#1a120d" : "#13110f",
              8,
              22,
            ]}
          />

          {/* Dynamic Environment Lighting */}
          {lighting === "day" && (
            <>
              <ambientLight intensity={0.9} color="#ffffff" />
              <directionalLight position={[6, 12, 6]} intensity={1.8} color="#fff6e8" castShadow />
              <directionalLight position={[-6, 6, -4]} intensity={0.5} color="#c0d0e0" />
            </>
          )}

          {lighting === "sunset" && (
            <>
              <ambientLight intensity={0.65} color="#e09060" />
              <directionalLight position={[10, 5, 4]} intensity={2.4} color="#ff9944" />
              <pointLight position={[-4, 2, -3]} intensity={1.0} color="#604080" />
            </>
          )}

          {lighting === "night" && (
            <>
              <ambientLight intensity={0.25} color="#405070" />
              <spotLight position={[0, 8, 4]} angle={0.6} penumbra={0.8} intensity={3.5} color={GOLD} />
              <pointLight position={[3, 1, 2]} intensity={2.0} color="#ffaa55" distance={6} />
              <pointLight position={[-3, 1, 2]} intensity={2.0} color="#ffaa55" distance={6} />
            </>
          )}

          {/* High-Resolution 3D Architectural Stage */}
          <CurvedPhotoStage activeView={currentView} lighting={lighting} />

          {/* Interactive Architectural Hotspot Nodes */}
          {hotspots.map((spot) => (
            <HotspotMarker
              key={spot.id}
              spot={spot}
              active={activeHotspot?.id === spot.id}
              onClick={() => setActiveHotspot(spot)}
            />
          ))}

          {/* 360 Orbit Camera Control */}
          <OrbitCamera
            orbitYaw={orbitYaw}
            orbitPitch={orbitPitch}
            zoom={zoom}
            autoRotate={!dragging && motion === true}
          />
        </Canvas>

        {/* Top Control Bar: Studio Mode & Lighting Toggles */}
        <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex items-center justify-between px-3 sm:px-5">
          <div className="flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] sm:text-xs font-mono backdrop-blur-md border border-ivory/10 text-ivory/80">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-gold">3D STUDIO</span>
            <span className="text-ivory/40 hidden sm:inline">|</span>
            <span className="hidden sm:inline">360° ORBIT</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-ink/80 p-0.5 sm:p-1 backdrop-blur-md border border-ivory/15">
            <button
              type="button"
              onClick={() => setLighting("day")}
              className={`rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs transition-all ${
                lighting === "day" ? "bg-gold text-ink font-semibold" : "text-ivory/70 hover:text-ivory"
              }`}
            >
              ☀️ Day
            </button>
            <button
              type="button"
              onClick={() => setLighting("sunset")}
              className={`rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs transition-all ${
                lighting === "sunset" ? "bg-gold text-ink font-semibold" : "text-ivory/70 hover:text-ivory"
              }`}
            >
              🌅 Golden
            </button>
            <button
              type="button"
              onClick={() => setLighting("night")}
              className={`rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs transition-all ${
                lighting === "night" ? "bg-gold text-ink font-semibold" : "text-ivory/70 hover:text-ivory"
              }`}
            >
              🌙 Night
            </button>
          </div>
        </div>

        {/* Active Hotspot Modal Card */}
        {activeHotspot && (
          <div className="absolute bottom-14 left-3 right-3 sm:left-auto sm:right-6 sm:w-80 z-20 rounded-2xl border border-gold/40 bg-ink/95 p-4 shadow-2xl backdrop-blur-xl animate-[fadein_.2s_ease]">
            <div className="flex items-start justify-between">
              <div>
                <span className="tag-verified text-[10px]">Architectural Feature</span>
                <h4 className="font-serif text-lg font-bold text-ivory mt-0.5">{activeHotspot.name}</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveHotspot(null)}
                className="text-ivory/60 hover:text-ivory text-sm"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-xs text-ivory/80 leading-relaxed">{activeHotspot.note}</p>
          </div>
        )}

        {/* Bottom Helper Bar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-2.5 px-3 text-center">
          <p className="text-[10px] sm:text-[11px] font-mono text-ivory/50">
            ↔ Swipe or drag to orbit 360° · Tap golden pins for features
          </p>
        </div>
      </div>

      {/* Multi-Angle View Selector - SOLVES "DONT USE SAME IMAGE AGAIN AND AGAIN" */}
      <div className="card !p-4 border-ivory/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="eyebrow !text-gold">Authentic Perspectives</span>
            <h4 className="font-serif text-lg font-bold text-ivory">Multi-Angle Monument Views</h4>
          </div>
          <span className="text-xs text-ivory/50 font-mono">
            {activeViewIdx + 1} of {views.length} views
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {views.map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                setActiveViewIdx(i);
                setActiveHotspot(null);
              }}
              className={`flex items-center gap-3 rounded-xl p-2 text-left transition-all border ${
                activeViewIdx === i
                  ? "border-gold bg-gold/15 shadow-md shadow-gold/10"
                  : "border-ivory/10 bg-charcoal/40 hover:border-ivory/30"
              }`}
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-ivory/10">
                <SmartImage src={v.url} alt={v.label} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold truncate ${activeViewIdx === i ? "text-gold" : "text-ivory"}`}>
                  {v.label}
                </p>
                <p className="line-clamp-1 text-[11px] text-ivory/60">{v.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

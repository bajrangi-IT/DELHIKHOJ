"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSectionProgress } from "@/lib/useSectionProgress";
import { isLowEnd, useMotionAllowed, webglSupported } from "@/lib/motion";
import SmartImage from "@/components/SmartImage";

const SAND = "#C9A77B", RED = "#9C4A3C", MARBLE = "#F3EBDD", GOLD = "#C69A50", DARK = "#3a2f28";

/** Stylised procedural monument — an illustrative 3D model, not a photo-real scan. */
function Model({ slug, category }: { slug: string; category: string }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s, dt) => { if (g.current) g.current.rotation.y += dt * 0.25; });

  const kind =
    slug.includes("minar") || slug === "feroz-shah-kotla" ? "minar"
    : slug.includes("fort") || slug.includes("qila") || slug.includes("kotla") ? "fort"
    : slug === "india-gate" || slug === "national-war-memorial" ? "arch"
    : slug === "lotus-temple" ? "lotus"
    : slug === "agrasen-ki-baoli" ? "baoli"
    : slug === "jama-masjid" || slug.includes("masjid") || slug.includes("dargah") || slug.includes("temple") || slug.includes("mandir") || slug.includes("gurudwara") || slug.includes("cathedral") || slug === "akshardham" ? "mosque"
    : category === "garden" || category === "hidden" ? "garden"
    : category === "museum" || category === "civic" ? "block"
    : category === "memorial" ? "obelisk"
    : category === "monument" ? "tomb"
    : "tomb";

  return (
    <group ref={g}>
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[9, 48]} />
        <meshStandardMaterial color="#1d1b19" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <ringGeometry args={[7.2, 9, 48]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.35} />
      </mesh>

      {kind === "minar" && (
        <group>
          {[0, 1, 2, 3, 4].map((i) => (
            <group key={i} position={[0, i * 1.9, 0]}>
              <mesh position={[0, 0.95, 0]} castShadow>
                <cylinderGeometry args={[1.15 - i * 0.16, 1.3 - i * 0.16, 1.9, 12]} />
                <meshStandardMaterial color={i % 2 ? MARBLE : RED} roughness={0.9} />
              </mesh>
              <mesh position={[0, 1.9, 0]}>
                <cylinderGeometry args={[1.32 - i * 0.16, 1.32 - i * 0.16, 0.22, 12]} />
                <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.4} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 9.8, 0]}><coneGeometry args={[0.75, 1.2, 12]} /><meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.3} /></mesh>
        </group>
      )}

      {kind === "fort" && (
        <group>
          {[-4, 4].map((x) => [-4, 4].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 2.2, z]} castShadow>
              <cylinderGeometry args={[1.1, 1.3, 4.4, 8]} />
              <meshStandardMaterial color={RED} roughness={0.95} />
            </mesh>
          )))}
          <mesh position={[0, 1.4, -4]} castShadow><boxGeometry args={[10.5, 2.8, 0.9]} /><meshStandardMaterial color={RED} roughness={0.95} /></mesh>
          <mesh position={[0, 1.4, 4]} castShadow><boxGeometry args={[10.5, 2.8, 0.9]} /><meshStandardMaterial color={RED} roughness={0.95} /></mesh>
          <mesh position={[-4, 1.4, 0]} castShadow><boxGeometry args={[0.9, 2.8, 10.5]} /><meshStandardMaterial color={RED} roughness={0.95} /></mesh>
          <mesh position={[4, 1.4, 0]} castShadow><boxGeometry args={[0.9, 2.8, 10.5]} /><meshStandardMaterial color={RED} roughness={0.95} /></mesh>
          {/* gate */}
          <mesh position={[0, 2.6, -4]}><boxGeometry args={[3.4, 1.2, 1]} /><meshStandardMaterial color={DARK} /></mesh>
          <mesh position={[-1.2, 1.2, -4]}><boxGeometry args={[0.8, 2.4, 1]} /><meshStandardMaterial color={SAND} /></mesh>
          <mesh position={[1.2, 1.2, -4]}><boxGeometry args={[0.8, 2.4, 1]} /><meshStandardMaterial color={SAND} /></mesh>
          <mesh position={[0, 1.6, 0]} castShadow><boxGeometry args={[2.6, 1.6, 2.2]} /><meshStandardMaterial color={MARBLE} roughness={0.7} /></mesh>
          <mesh position={[0, 2.7, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[1.9, 1.2, 4]} /><meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.4} /></mesh>
        </group>
      )}

      {kind === "tomb" && (
        <group>
          <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[6, 1, 6]} /><meshStandardMaterial color={SAND} roughness={0.9} /></mesh>
          <mesh position={[0, 1.8, 0]} castShadow><boxGeometry args={[4.2, 1.8, 4.2]} /><meshStandardMaterial color={RED} roughness={0.9} /></mesh>
          <mesh position={[0, 3.4, 0]}><sphereGeometry args={[2.1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={MARBLE} roughness={0.5} /></mesh>
          <mesh position={[0, 4.6, 0]}><cylinderGeometry args={[0.06, 0.06, 0.9, 8]} /><meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.3} /></mesh>
          {[-2.6, 2.6].map((x) => [-2.6, 2.6].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.7, z]}><boxGeometry args={[0.7, 1.4, 0.7]} /><meshStandardMaterial color={MARBLE} roughness={0.6} /></mesh>
          )))}
        </group>
      )}

      {kind === "arch" && (
        <group>
          <mesh position={[0, 0.4, 0]}><boxGeometry args={[8, 0.8, 3]} /><meshStandardMaterial color={SAND} roughness={0.9} /></mesh>
          <ArchShape />
        </group>
      )}

      {kind === "mosque" && (
        <group>
          <mesh position={[0, 1.2, 0]} castShadow><boxGeometry args={[6, 2.4, 4]} /><meshStandardMaterial color={RED} roughness={0.9} /></mesh>
          <mesh position={[0, 2.9, 0]}><sphereGeometry args={[1.6, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={MARBLE} roughness={0.5} /></mesh>
          {[-2.6, 2.6].map((x) => (
            <group key={x} position={[x, 0, -1]}>
              <mesh position={[0, 2.6, 0]}><cylinderGeometry args={[0.42, 0.55, 5.2, 8]} /><meshStandardMaterial color={SAND} roughness={0.9} /></mesh>
              <mesh position={[0, 5.4, 0]}><coneGeometry args={[0.55, 0.8, 8]} /><meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.35} /></mesh>
            </group>
          ))}
          <mesh position={[0, 0.9, 2.05]}><boxGeometry args={[1.4, 1.8, 0.15]} /><meshStandardMaterial color={DARK} /></mesh>
        </group>
      )}

      {kind === "lotus" && (
        <group>
          {[0, 1, 2].map((ring) =>
            Array.from({ length: 9 }, (_, i) => {
              const a = (i / 9) * Math.PI * 2;
              const r = 2.2 + ring * 1.15;
              return (
                <mesh key={`${ring}-${i}`} position={[Math.cos(a) * r, 0.6 + ring * 0.55, Math.sin(a) * r]}
                  rotation={[Math.PI / 2 - 0.55, 0, a]}
                >
                  <coneGeometry args={[0.62, 2.6 - ring * 0.4, 4]} />
                  <meshStandardMaterial color={MARBLE} roughness={0.45} side={THREE.DoubleSide} />
                </mesh>
              );
            }),
          )}
          <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[5.6, 5.9, 0.5, 32]} /><meshStandardMaterial color={SAND} roughness={0.9} /></mesh>
        </group>
      )}

      {kind === "baoli" && (
        <group>
          {[0, 1, 2].map((lvl) => (
            <mesh key={lvl} position={[0, 0.4 + lvl * 0.9, 0]}>
              <boxGeometry args={[7 - lvl * 1.6, 0.5, 5 - lvl * 1.2]} />
              <meshStandardMaterial color={lvl % 2 ? SAND : RED} roughness={0.95} />
            </mesh>
          ))}
          {[-2.4, -1.2, 1.2, 2.4].map((x) => (
            <mesh key={x} position={[x, 2.6, -2.6]}>
              <boxGeometry args={[0.5, 3.4, 0.5]} />
              <meshStandardMaterial color={SAND} roughness={0.9} />
            </mesh>
          ))}
          <mesh position={[0, 2.2, -2.6]}><boxGeometry args={[6, 0.5, 0.6]} /><meshStandardMaterial color={GOLD} metalness={0.4} roughness={0.5} /></mesh>
        </group>
      )}

      {kind === "garden" && (
        <group>
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const r = 3 + (i % 3) * 1.4;
            return (
              <group key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]}>
                <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.12, 0.16, 1, 6]} /><meshStandardMaterial color="#4a3b2a" /></mesh>
                <mesh position={[0, 1.5, 0]}><coneGeometry args={[0.9, 1.8, 8]} /><meshStandardMaterial color="#2f5d43" roughness={1} /></mesh>
              </group>
            );
          })}
          <mesh position={[0, 0.8, 0]} castShadow><boxGeometry args={[2.4, 1.6, 2.4]} /><meshStandardMaterial color={RED} roughness={0.9} /></mesh>
          <mesh position={[0, 2, 0]}><sphereGeometry args={[1.25, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={MARBLE} roughness={0.5} /></mesh>
        </group>
      )}

      {kind === "obelisk" && (
        <group>
          <mesh position={[0, 0.5, 0]}><boxGeometry args={[5, 1, 5]} /><meshStandardMaterial color={SAND} roughness={0.9} /></mesh>
          <mesh position={[0, 3.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.9, 6, 4]} />
            <meshStandardMaterial color="#15130f" roughness={0.6} />
          </mesh>
        </group>
      )}

      {kind === "block" && (
        <group>
          <mesh position={[0, 0.5, 0]}><boxGeometry args={[7, 1, 5]} /><meshStandardMaterial color={SAND} roughness={0.9} /></mesh>
          <mesh position={[0, 2, 0]} castShadow><boxGeometry args={[5.4, 3, 3.6]} /><meshStandardMaterial color={MARBLE} roughness={0.6} /></mesh>
          <mesh position={[0, 4.1, 0]}><cylinderGeometry args={[1.5, 1.7, 0.7, 16]} /><meshStandardMaterial color={SAND} roughness={0.8} /></mesh>
          {[-2, -0.7, 0.7, 2].map((x) => (
            <mesh key={x} position={[x, 1.5, 1.85]}><boxGeometry args={[0.5, 1.6, 0.1]} /><meshStandardMaterial color={DARK} /></mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function ArchShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-3.4, 0); shape.lineTo(-3.4, 6.4); shape.lineTo(3.4, 6.4); shape.lineTo(3.4, 0);
  const hole = new THREE.Path();
  hole.moveTo(-1.5, 0); hole.lineTo(-1.5, 4.2); hole.absarc(0, 4.2, 1.5, Math.PI, 0, true); hole.lineTo(1.5, 0);
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 1.1, bevelEnabled: false });
  return (
    <mesh geometry={geo} position={[0, 0.8, -0.55]} castShadow>
      <meshStandardMaterial color={SAND} roughness={0.85} />
    </mesh>
  );
}

function Camera({ progress }: { progress: { current: number } }) {
  useFrame(({ camera, pointer }) => {
    const z = THREE.MathUtils.lerp(16, 9, progress.current);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, z, 0.08);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 1.2, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 3.4 - progress.current * 1.2 + pointer.y * 0.5, 0.05);
    camera.lookAt(0, 2.4, 0);
  });
  return null;
}

export default function Monument3D({ slug, name, category, image }: { slug: string; name: string; category: string; image: string | null }) {
  const motion = useMotionAllowed();
  const [gl, setGl] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(false);
  const wrap = useRef<HTMLElement>(null);
  const enabled = !!motion && !!gl;
  const { sectionRef, progressRef } = useSectionProgress(enabled);

  useEffect(() => setGl(webglSupported() && !isLowEnd()), []);
  useEffect(() => {
    if (!wrap.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  if (motion === null || gl === null) return <div className="skeleton aspect-video w-full rounded-2xl" aria-label="Loading 3D view" />;
  if (!enabled || !visible)
    return <SmartImage src={image} alt={`Photograph of ${name}`} fallbackLabel={name} className="aspect-video w-full rounded-2xl border border-ivory/10" />;

  return (
    <section ref={(el) => { wrap.current = el as HTMLElement | null; if (el) (sectionRef as React.MutableRefObject<HTMLElement | null>).current = el; }} className="relative" style={{ height: "170vh" }} aria-label={`Interactive 3D model of ${name}`}>
      <div className="sticky top-16 h-[82vh] overflow-hidden rounded-2xl border border-ivory/10 bg-ink">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 3.4, 16], fov: 45 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <color attach="background" args={["#11100E"]} />
          <fog attach="fog" args={["#11100E", 14, 30]} />
          <hemisphereLight args={["#F3EBDD", "#241f1a", 1.1]} />
          <directionalLight position={[6, 10, 6]} intensity={1.6} color="#FFD9A0" />
          <pointLight position={[-6, 4, -4]} intensity={8} color={GOLD} />
          <Model slug={slug} category={category} />
          <Camera progress={progressRef} />
        </Canvas>
        <div className="pointer-events-none absolute inset-x-0 top-4 text-center">
          <p className="eyebrow !text-[10px]">3D view — stylised model</p>
        </div>
        <div className="absolute inset-x-0 bottom-4 text-center">
          <p className="text-xs text-ivory/60">An illustrative 3D model, not a photographic reconstruction · drag-free auto-rotate · scroll to zoom</p>
        </div>
      </div>
    </section>
  );
}

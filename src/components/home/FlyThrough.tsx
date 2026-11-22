"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSectionProgress } from "@/lib/useSectionProgress";
import { isLowEnd, useMotionAllowed, webglSupported } from "@/lib/motion";
import SmartImage from "@/components/SmartImage";

export type FlyItem = {
  slug: string;
  name: string;
  era: string | null;
  summary: string;
  image: string | null;
};

// Colors
const SANDSTONE = "#a8543f";
const BUFF_SAND = "#d4af7a";
const MARBLE = "#f2ede4";
const GOLD = "#c69a50";
const DARK_SLATE = "#1f1d1a";
const AMBER_GLOW = "#ffb03a";
const RIVER_BLUE = "#0f3246";
const LAWN_GREEN = "#19281a";

// 5 Key Landmark Waypoints in the 3D Delhi World
const WAYPOINTS = [
  {
    slug: "india-gate",
    name: "India Gate",
    era: "Colonial",
    coords: "28.6129° N, 77.2295° E",
    alt: 120,
    pos: [0, 0, 16] as [number, number, number],
    camPos: [0, 11, 32] as [number, number, number],
    lookAt: [0, 3, 16] as [number, number, number],
  },
  {
    slug: "humayuns-tomb",
    name: "Humayun's Tomb",
    era: "Mughal",
    coords: "28.5933° N, 77.2507° E",
    alt: 145,
    pos: [16, 0, -22] as [number, number, number],
    camPos: [8, 10, -8] as [number, number, number],
    lookAt: [16, 3, -22] as [number, number, number],
  },
  {
    slug: "red-fort",
    name: "Red Fort (Lal Qila)",
    era: "Mughal",
    coords: "28.6562° N, 77.2410° E",
    alt: 135,
    pos: [-18, 0, -62] as [number, number, number],
    camPos: [-8, 12, -48] as [number, number, number],
    lookAt: [-18, 4, -62] as [number, number, number],
  },
  {
    slug: "lotus-temple",
    name: "Lotus Temple",
    era: "Modern Heritage",
    coords: "28.5535° N, 77.2588° E",
    alt: 160,
    pos: [20, 0, -100] as [number, number, number],
    camPos: [10, 13, -86] as [number, number, number],
    lookAt: [20, 3, -100] as [number, number, number],
  },
  {
    slug: "qutub-minar",
    name: "Qutub Minar",
    era: "Delhi Sultanate",
    coords: "28.5245° N, 77.1855° E",
    alt: 185,
    pos: [-18, 0, -140] as [number, number, number],
    camPos: [-8, 16, -124] as [number, number, number],
    lookAt: [-18, 7, -140] as [number, number, number],
  },
];

// --- 3D MONUMENT MODELS ---

function IndiaGateModel({ position }: { position: [number, number, number] }) {
  const flameRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (flameRef.current) {
      flameRef.current.intensity = 2.5 + Math.sin(state.clock.elapsedTime * 6) * 0.7;
    }
  });

  return (
    <group position={position}>
      {/* Stepped Pedestal */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.2, 0.8, 3.6]} />
        <meshStandardMaterial color={BUFF_SAND} roughness={0.9} />
      </mesh>
      {/* Left Pillar */}
      <mesh position={[-1.9, 2.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 3.8, 2.6]} />
        <meshStandardMaterial color={SANDSTONE} roughness={0.85} />
      </mesh>
      {/* Right Pillar */}
      <mesh position={[1.9, 2.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 3.8, 2.6]} />
        <meshStandardMaterial color={SANDSTONE} roughness={0.85} />
      </mesh>
      {/* Arch Top Lintel */}
      <mesh position={[0, 4.4, 0]} castShadow>
        <boxGeometry args={[5.6, 1.2, 2.7]} />
        <meshStandardMaterial color={BUFF_SAND} roughness={0.85} />
      </mesh>
      {/* Attic & Cornice */}
      <mesh position={[0, 5.4, 0]} castShadow>
        <boxGeometry args={[6.2, 0.8, 3.0]} />
        <meshStandardMaterial color={SANDSTONE} roughness={0.8} />
      </mesh>
      <mesh position={[0, 6.0, 0]}>
        <boxGeometry args={[4.2, 0.5, 2.2]} />
        <meshStandardMaterial color={BUFF_SAND} roughness={0.7} />
      </mesh>
      {/* Amar Jawan Jyoti Eternal Flame */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.3, 8]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
      <pointLight ref={flameRef} position={[0, 1.2, 0]} color="#ff9933" distance={10} />
      {/* Vertical Golden Beacon Beam */}
      <mesh position={[0, 16, 0]}>
        <cylinderGeometry args={[0.06, 0.3, 30, 8]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.22} />
      </mesh>
      {/* Holographic Target Ring on Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[6.5, 7.0, 32]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function HumayunTombModel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Elevated Sandstone Plinth */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 1.8, 12]} />
        <meshStandardMaterial color={SANDSTONE} roughness={0.9} />
      </mesh>
      {/* Main Chamber */}
      <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.2, 3.0, 7.2]} />
        <meshStandardMaterial color={SANDSTONE} roughness={0.85} />
      </mesh>
      {/* Marble Central Facade Inlay */}
      <mesh position={[0, 3.2, 3.65]}>
        <boxGeometry args={[4.0, 2.6, 0.1]} />
        <meshStandardMaterial color={MARBLE} roughness={0.6} />
      </mesh>
      {/* Dome Drum */}
      <mesh position={[0, 5.0, 0]} castShadow>
        <cylinderGeometry args={[2.2, 2.4, 1.2, 16]} />
        <meshStandardMaterial color={BUFF_SAND} roughness={0.7} />
      </mesh>
      {/* Marble Double Dome */}
      <mesh position={[0, 6.2, 0]} castShadow>
        <sphereGeometry args={[2.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={MARBLE} roughness={0.4} />
      </mesh>
      {/* Brass Finial */}
      <mesh position={[0, 8.6, 0]}>
        <coneGeometry args={[0.2, 0.7, 8]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
      {/* 4 Corner Chhatris */}
      {[-3, 3].map((x) =>
        [-3, 3].map((z) => (
          <group key={`${x}-${z}`} position={[x, 5.0, z]}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.8, 8]} />
              <meshStandardMaterial color={BUFF_SAND} />
            </mesh>
            <mesh position={[0, 1.0, 0]}>
              <coneGeometry args={[0.65, 0.6, 8]} />
              <meshStandardMaterial color={MARBLE} />
            </mesh>
          </group>
        ))
      )}
      {/* Charbagh Water Channels */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[18, 0.8]} />
        <meshBasicMaterial color={RIVER_BLUE} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[0.8, 18]} />
        <meshBasicMaterial color={RIVER_BLUE} />
      </mesh>
      {/* Beacon Light */}
      <mesh position={[0, 16, 0]}>
        <cylinderGeometry args={[0.06, 0.3, 30, 8]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function RedFortModel({ position }: { position: [number, number, number] }) {
  const flagRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.25;
    }
  });

  return (
    <group position={position}>
      {/* Front Battlement Wall */}
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[18, 4.4, 1.4]} />
        <meshStandardMaterial color={SANDSTONE} roughness={0.95} />
      </mesh>
      {/* Corner Octagonal Bastions */}
      {[-9, 9].map((x) => (
        <group key={x} position={[x, 2.5, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[1.8, 2.0, 5.0, 8]} />
            <meshStandardMaterial color={SANDSTONE} roughness={0.95} />
          </mesh>
          <mesh position={[0, 3.0, 0]}>
            <coneGeometry args={[1.6, 1.2, 8]} />
            <meshStandardMaterial color={MARBLE} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Central Lahori Gate Portal */}
      <mesh position={[0, 2.5, 0.4]} castShadow>
        <boxGeometry args={[4.6, 5.2, 1.6]} />
        <meshStandardMaterial color={SANDSTONE} roughness={0.9} />
      </mesh>
      {/* Central Gate Arch Cutout */}
      <mesh position={[0, 1.6, 1.3]}>
        <boxGeometry args={[2.0, 3.2, 0.2]} />
        <meshBasicMaterial color={DARK_SLATE} />
      </mesh>
      {/* Gate Top Cupolas (Chhatris) */}
      {[-1.5, 1.5].map((x) => (
        <group key={x} position={[x, 5.6, 0.4]}>
          <mesh>
            <cylinderGeometry args={[0.4, 0.4, 0.8, 8]} />
            <meshStandardMaterial color={BUFF_SAND} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <coneGeometry args={[0.55, 0.6, 8]} />
            <meshBasicMaterial color={GOLD} />
          </mesh>
        </group>
      ))}
      {/* Indian National Flag Mast */}
      <mesh position={[0, 6.2, 0.4]}>
        <cylinderGeometry args={[0.04, 0.04, 2.6, 8]} />
        <meshStandardMaterial color={BUFF_SAND} />
      </mesh>
      <mesh ref={flagRef} position={[0.45, 7.0, 0.4]}>
        <boxGeometry args={[0.9, 0.5, 0.02]} />
        <meshBasicMaterial color="#FF9933" />
      </mesh>
      {/* Beacon Light */}
      <mesh position={[0, 16, 0]}>
        <cylinderGeometry args={[0.06, 0.3, 30, 8]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function LotusTempleModel({ position }: { position: [number, number, number] }) {
  const petals = useMemo(() => {
    return Array.from({ length: 9 }).map((_, i) => (i * Math.PI * 2) / 9);
  }, []);

  return (
    <group position={position}>
      {/* Base Podium */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]} receiveShadow>
        <circleGeometry args={[8.5, 9]} />
        <meshStandardMaterial color={BUFF_SAND} roughness={0.8} />
      </mesh>
      {/* 9 Surrounding Pools */}
      {petals.map((angle, i) => {
        const x = Math.sin(angle) * 6.2;
        const z = Math.cos(angle) * 6.2;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.25, z]}>
            <circleGeometry args={[1.5, 12]} />
            <meshBasicMaterial color="#00a896" />
          </mesh>
        );
      })}
      {/* Outer Petals */}
      {petals.map((angle, i) => {
        const x = Math.sin(angle) * 3.2;
        const z = Math.cos(angle) * 3.2;
        return (
          <mesh
            key={`outer-${i}`}
            position={[x, 1.8, z]}
            rotation={[0.35, angle, 0]}
            castShadow
          >
            <coneGeometry args={[1.6, 3.8, 4]} />
            <meshStandardMaterial color={MARBLE} roughness={0.3} />
          </mesh>
        );
      })}
      {/* Inner Petals */}
      {petals.map((angle, i) => {
        const x = Math.sin(angle + 0.35) * 1.8;
        const z = Math.cos(angle + 0.35) * 1.8;
        return (
          <mesh
            key={`inner-${i}`}
            position={[x, 3.2, z]}
            rotation={[0.15, angle + 0.35, 0]}
            castShadow
          >
            <coneGeometry args={[1.3, 4.4, 4]} />
            <meshStandardMaterial color={MARBLE} roughness={0.25} />
          </mesh>
        );
      })}
      {/* Central Skylight */}
      <mesh position={[0, 4.8, 0]}>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <pointLight position={[0, 4.0, 0]} color="#ffffff" intensity={2} distance={8} />
      {/* Beacon Light */}
      <mesh position={[0, 16, 0]}>
        <cylinderGeometry args={[0.06, 0.3, 30, 8]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function QutubMinarModel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 5 Tapered Tiers of Qutub Minar */}
      {[0, 1, 2, 3, 4].map((i) => {
        const y = i * 2.5;
        const botR = 1.6 - i * 0.18;
        const topR = 1.45 - i * 0.18;
        const isMarble = i === 2 || i === 3;
        return (
          <group key={i} position={[0, y, 0]}>
            {/* Fluted Minaret Tier */}
            <mesh position={[0, 1.25, 0]} castShadow>
              <cylinderGeometry args={[topR, botR, 2.5, 16]} />
              <meshStandardMaterial
                color={isMarble ? MARBLE : SANDSTONE}
                roughness={0.85}
              />
            </mesh>
            {/* Projecting Balcony */}
            <mesh position={[0, 2.5, 0]} castShadow>
              <cylinderGeometry args={[topR + 0.3, topR + 0.1, 0.25, 16]} />
              <meshStandardMaterial color={BUFF_SAND} roughness={0.6} />
            </mesh>
          </group>
        );
      })}
      {/* Apex Minaret Finial */}
      <mesh position={[0, 12.8, 0]}>
        <coneGeometry args={[0.6, 1.4, 12]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
      {/* Surrounding Alai Darwaza Ruins Arches */}
      {[-4, 4].map((x) => (
        <group key={x} position={[x, 1.5, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.2, 3.0, 1.2]} />
            <meshStandardMaterial color={SANDSTONE} roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[2.0, 0.6, 1.2]} />
            <meshStandardMaterial color={BUFF_SAND} roughness={0.8} />
          </mesh>
        </group>
      ))}
      {/* Beacon Light */}
      <mesh position={[0, 18, 0]}>
        <cylinderGeometry args={[0.06, 0.3, 34, 8]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

// --- 3D CITY ENVIRONMENT: PROCEDURAL SKYLINE & ROADS ---

function DelhiCityscape() {
  const { buildings, trafficPoints } = useMemo(() => {
    const blds: Array<{ pos: [number, number, number]; size: [number, number, number]; color: string; hasGlow: boolean }> = [];
    const colors = [SANDSTONE, BUFF_SAND, "#665849", "#3b3630", "#8c6f56"];

    // Deterministic pseudo-random seed
    let seed = 42;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Scatter 110 city buildings avoiding monument clearings
    for (let i = 0; i < 110; i++) {
      const z = -rnd() * 160 + 10;
      const side = rnd() > 0.5 ? 1 : -1;
      const x = side * (8 + rnd() * 26);
      const h = 2.5 + rnd() * 12;
      const w = 2.5 + rnd() * 4.5;
      const d = 2.5 + rnd() * 4.5;

      blds.push({
        pos: [x, h / 2, z],
        size: [w, h, d],
        color: colors[Math.floor(rnd() * colors.length)],
        hasGlow: rnd() > 0.4,
      });
    }

    // Traffic light points along central avenues
    const traffic: Array<{ x: number; z: number; speed: number; isRed: boolean }> = [];
    for (let i = 0; i < 60; i++) {
      traffic.push({
        x: (rnd() > 0.5 ? 1 : -1) * (2.8 + rnd() * 0.8),
        z: -rnd() * 160,
        speed: 0.15 + rnd() * 0.3,
        isRed: rnd() > 0.5,
      });
    }

    return { buildings: blds, trafficPoints: traffic };
  }, []);

  const trafficRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!trafficRef.current) return;
    trafficRef.current.children.forEach((child, i) => {
      const t = trafficPoints[i];
      if (t) {
        child.position.z += t.isRed ? t.speed : -t.speed;
        if (child.position.z > 25) child.position.z = -160;
        if (child.position.z < -160) child.position.z = 25;
      }
    });
  });

  return (
    <group>
      {/* Ground Plain (Delhi Landmass) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -70]} receiveShadow>
        <planeGeometry args={[180, 240]} />
        <meshStandardMaterial color="#14120e" roughness={1} />
      </mesh>

      {/* Yamuna River Curve */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[28, 0.02, -70]}>
        <planeGeometry args={[14, 240]} />
        <meshStandardMaterial color={RIVER_BLUE} roughness={0.2} metalness={0.6} />
      </mesh>

      {/* Main Rajpath / Kartavya Path Central Avenue */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -70]}>
        <planeGeometry args={[5.2, 240]} />
        <meshStandardMaterial color="#22201e" roughness={0.8} />
      </mesh>

      {/* Central Avenue Green Lawns */}
      {[-4.5, 4.5].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.015, -70]}>
          <planeGeometry args={[3.2, 240]} />
          <meshStandardMaterial color={LAWN_GREEN} roughness={0.9} />
        </mesh>
      ))}

      {/* 3D City Buildings */}
      {buildings.map((b, i) => (
        <group key={i} position={b.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color={b.color} roughness={0.85} />
          </mesh>
          {b.hasGlow && (
            <mesh position={[0, 0, b.size[2] / 2 + 0.02]}>
              <planeGeometry args={[b.size[0] * 0.7, b.size[1] * 0.6]} />
              <meshBasicMaterial color={AMBER_GLOW} transparent opacity={0.35} />
            </mesh>
          )}
        </group>
      ))}

      {/* Dynamic Moving Traffic Lights */}
      <group ref={trafficRef}>
        {trafficPoints.map((t, i) => (
          <mesh key={i} position={[t.x, 0.2, t.z]}>
            <sphereGeometry args={[0.18, 6, 6]} />
            <meshBasicMaterial color={t.isRed ? "#ff3333" : "#fff2cc"} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// --- DRONE FLIGHT CAMERA CONTROLLER ---

function DroneCamera({
  progress,
  activeWaypointIdx,
  setActiveWaypointIdx,
}: {
  progress: MutableRefObject<number>;
  activeWaypointIdx: number;
  setActiveWaypointIdx: (idx: number) => void;
}) {
  const { camera } = useThree();

  useFrame((state) => {
    const p = Math.max(0, Math.min(1, progress.current));

    // Spline interpolation across the 5 waypoints
    const totalWaypoints = WAYPOINTS.length - 1;
    const exactIndex = p * totalWaypoints;
    const baseIndex = Math.min(Math.floor(exactIndex), totalWaypoints - 1);
    const alpha = exactIndex - baseIndex;

    const currentWP = WAYPOINTS[baseIndex];
    const nextWP = WAYPOINTS[Math.min(baseIndex + 1, totalWaypoints)];

    // Target camera position
    const targetX = THREE.MathUtils.lerp(currentWP.camPos[0], nextWP.camPos[0], alpha);
    const targetY = THREE.MathUtils.lerp(currentWP.camPos[1], nextWP.camPos[1], alpha);
    const targetZ = THREE.MathUtils.lerp(currentWP.camPos[2], nextWP.camPos[2], alpha);

    // Target Look-At position
    const lookX = THREE.MathUtils.lerp(currentWP.lookAt[0], nextWP.lookAt[0], alpha);
    const lookY = THREE.MathUtils.lerp(currentWP.lookAt[1], nextWP.lookAt[1], alpha);
    const lookZ = THREE.MathUtils.lerp(currentWP.lookAt[2], nextWP.lookAt[2], alpha);

    // Subtle FPV drone motor hum vibration
    const t = state.clock.elapsedTime;
    const droneDriftY = Math.sin(t * 3.5) * 0.08;
    const droneDriftX = Math.cos(t * 2.8) * 0.06;

    // Mouse pointer parallax tilt (gimbal movement)
    const pointerX = state.pointer.x * 2.0;
    const pointerY = state.pointer.y * 1.2;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX + droneDriftX + pointerX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + droneDriftY + pointerY, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);

    camera.lookAt(lookX, lookY, lookZ);

    // Drone Banking (roll tilt on turns)
    const deltaX = nextWP.camPos[0] - currentWP.camPos[0];
    const targetRoll = -deltaX * 0.025;
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetRoll, 0.05);

    // Update active waypoint index based on proximity
    const closestIdx = Math.round(exactIndex);
    if (closestIdx !== activeWaypointIdx) {
      setActiveWaypointIdx(closestIdx);
    }
  });

  return null;
}

// --- 2D ACCESSIBLE FALLBACK ---

function Fallback({ items }: { items: FlyItem[] }) {
  return (
    <div className="wrap section">
      <h2 className="h-section">Delhi City Aerial Tour</h2>
      <ul className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4">
        {items.map((it) => (
          <li key={it.slug} className="w-72 shrink-0 snap-start">
            <Link
              href={`/destination/${it.slug}`}
              className="block overflow-hidden rounded-2xl border border-ivory/10 bg-charcoal"
            >
              <SmartImage src={it.image} alt={it.name} className="aspect-[4/3] w-full" />
              <span className="block p-4 font-serif text-xl">{it.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- MAIN 3D DELHI DRONE EXPERIENCE ---

export default function FlyThrough({ items }: { items: FlyItem[] }) {
  const motion = useMotionAllowed();
  const [gl, setGl] = useState<boolean | null>(null);
  const [autoFly, setAutoFly] = useState(false);
  const [activeWpIdx, setActiveWpIdx] = useState(0);

  useEffect(() => {
    setGl(webglSupported() && !isLowEnd());
  }, []);

  const enabled = !!motion && !!gl;
  const { sectionRef, progressRef, progress } = useSectionProgress(enabled);

  // Auto-Pilot flight timer
  useEffect(() => {
    if (!autoFly) return;
    const interval = setInterval(() => {
      if (progressRef.current < 0.99) {
        progressRef.current += 0.003;
      } else {
        progressRef.current = 0;
      }
    }, 30);
    return () => clearInterval(interval);
  }, [autoFly, progressRef]);

  const currentWP = WAYPOINTS[activeWpIdx] || WAYPOINTS[0];
  const matchedItem = items.find((it) => it.slug === currentWP.slug) || items[0] || {
    slug: currentWP.slug,
    name: currentWP.name,
    era: currentWP.era,
    summary: "Historic landmark in Delhi's urban fabric.",
    image: null,
  };

  // Jump to specific waypoint
  function jumpToWaypoint(idx: number) {
    if (sectionRef.current) {
      const targetPercent = idx / (WAYPOINTS.length - 1);
      progressRef.current = targetPercent;
      const top = sectionRef.current.offsetTop + targetPercent * (sectionRef.current.offsetHeight - window.innerHeight);
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  if (motion === null || gl === null) {
    return <div className="skeleton mx-auto my-20 h-96 max-w-5xl" aria-label="Loading Delhi 3D Drone Cityscape" />;
  }
  if (!enabled) return <Fallback items={items} />;

  // Calculated telemetry
  const displayAlt = Math.round(currentWP.alt + Math.sin(progress * Math.PI * 4) * 12);
  const displaySpeed = Math.round(48 + Math.cos(progress * Math.PI * 3) * 8);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: "450vh" }}
      aria-label="3D Drone flight over Delhi city"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0d0c0b]">
        {/* WebGL 3D Canvas */}
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 11, 32], fov: 52 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          shadows
        >
          <color attach="background" args={["#0d0c0b"]} />
          <fog attach="fog" args={["#0d0c0b", 30, 130]} />

          {/* Golden Hour / Twilight Lighting */}
          <ambientLight intensity={0.65} color="#e6d4c0" />
          <directionalLight
            position={[40, 60, 20]}
            intensity={1.8}
            color="#ffbb77"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-30, 40, -40]} intensity={0.4} color="#6688aa" />

          {/* 3D City Environment */}
          <DelhiCityscape />

          {/* 5 Iconic 3D Landmarks */}
          <IndiaGateModel position={WAYPOINTS[0].pos} />
          <HumayunTombModel position={WAYPOINTS[1].pos} />
          <RedFortModel position={WAYPOINTS[2].pos} />
          <LotusTempleModel position={WAYPOINTS[3].pos} />
          <QutubMinarModel position={WAYPOINTS[4].pos} />

          {/* Dynamic Drone Camera Rig */}
          <DroneCamera
            progress={progressRef}
            activeWaypointIdx={activeWpIdx}
            setActiveWaypointIdx={setActiveWpIdx}
          />
        </Canvas>

        {/* FPV DRONE HUD OVERLAYS */}

        {/* Top Tactical Bar */}
        <div className="pointer-events-none absolute inset-x-0 top-16 z-20 flex flex-wrap items-center justify-between gap-2 px-6 text-xs font-mono text-ivory/80">
          <div className="flex items-center gap-3 rounded-lg bg-ink/80 px-3 py-1.5 backdrop-blur-md border border-ivory/10">
            <span className="flex h-2.5 w-2.5 items-center justify-center">
              <span className="h-2 w-2 animate-ping rounded-full bg-red-500 opacity-75" />
            </span>
            <span className="font-bold text-red-400">● REC 4K HDR</span>
            <span className="text-ivory/40">|</span>
            <span className="text-gold font-semibold">DELHI AIRSPACE FPV</span>
          </div>

          {/* Compass Heading Tape */}
          <div className="hidden rounded-lg bg-ink/80 px-4 py-1.5 backdrop-blur-md border border-ivory/10 md:flex items-center gap-4 text-gold">
            <span>◄ 030° NNE</span>
            <span className="font-bold text-ivory">045° NE</span>
            <span>060° ENE ►</span>
          </div>

          {/* Telemetry Stats */}
          <div className="flex items-center gap-3 rounded-lg bg-ink/80 px-3 py-1.5 backdrop-blur-md border border-ivory/10">
            <span>
              ALT: <strong className="text-gold">{displayAlt} M</strong>
            </span>
            <span className="text-ivory/40">|</span>
            <span>
              SPD: <strong className="text-gold">{displaySpeed} KM/H</strong>
            </span>
            <span className="text-ivory/40">|</span>
            <span className="hidden sm:inline">
              BAT: <strong className="text-emerald-400">91% ⚡</strong>
            </span>
          </div>
        </div>

        {/* Central Drone Crosshairs / Reticle */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative h-40 w-40 opacity-40">
            {/* Gimbal Brackets */}
            <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-gold" />
            <div className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-gold" />
            <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-gold" />
            <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-gold" />
            {/* Center Reticle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full border border-gold" />
            </div>
            {/* Target Label */}
            <div className="absolute -bottom-7 inset-x-0 text-center font-mono text-[11px] font-bold text-gold">
              TARGET LOCK: {currentWP.name.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Quick Waypoint Jump Controls (Interactive) */}
        <div className="absolute top-32 inset-x-0 z-20 flex justify-center px-4 pointer-events-auto">
          <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-full bg-ink/80 p-1.5 backdrop-blur-md border border-ivory/15 shadow-xl">
            {WAYPOINTS.map((wp, i) => (
              <button
                key={wp.slug}
                type="button"
                onClick={() => jumpToWaypoint(i)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeWpIdx === i
                    ? "bg-gold text-ink shadow-md"
                    : "text-ivory/70 hover:bg-ivory/10 hover:text-ivory"
                }`}
              >
                📍 {wp.name.split(" ")[0]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAutoFly(!autoFly)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                autoFly ? "bg-emerald-500 text-ink animate-pulse" : "bg-ivory/10 text-ivory/80 hover:bg-ivory/20"
              }`}
            >
              {autoFly ? "❚❚ Pause Cruise" : "▶ Auto Cruise"}
            </button>
          </div>
        </div>

        {/* Bottom Inspection Card & Controls */}
        <div className="absolute inset-x-0 bottom-0 z-20 pb-8 pt-12 bg-gradient-to-t from-ink via-ink/80 to-transparent">
          <div className="wrap flex flex-col justify-between gap-4 md:flex-row md:items-end">
            {/* Target Monument Telemetry */}
            <div className="flex items-center gap-4">
              {matchedItem.image && (
                <div className="hidden sm:block h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-gold/40 shadow-xl">
                  <SmartImage
                    src={matchedItem.image}
                    alt={matchedItem.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="tag-verified text-[11px] font-mono">
                    WAYPOINT {String(activeWpIdx + 1).padStart(2, "0")}/{String(WAYPOINTS.length).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-xs text-gold">GPS {currentWP.coords}</span>
                </div>
                <h3 className="font-serif text-3xl sm:text-4xl text-ivory font-bold mt-1">
                  {matchedItem.name}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-ivory/70">
                  {matchedItem.summary}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Link
                href={`/destination/${matchedItem.slug}`}
                className="btn btn-gold !min-h-10 text-xs px-5 shadow-lg"
              >
                Explore Monument →
              </Link>
              <Link
                href={`/destination/${matchedItem.slug}#essentials`}
                className="btn btn-ghost !min-h-10 text-xs px-4 border-ivory/20"
              >
                🎟️ Book Pass
              </Link>
            </div>
          </div>

          {/* Flight Corridor Progress Bar */}
          <div className="wrap mt-5">
            <div className="flex items-center justify-between text-[11px] font-mono text-ivory/50 mb-1.5">
              <span>DRONE FLIGHT CORRIDOR</span>
              <span>SCROLL DOWN TO ADVANCE FLIGHT</span>
              <span>{Math.round(progress * 100)}% COMPLETE</span>
            </div>
            <div className="h-1 w-full rounded-full bg-ivory/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold via-sand to-gold transition-all duration-150"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

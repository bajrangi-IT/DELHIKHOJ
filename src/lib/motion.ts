"use client";
import { useEffect, useState } from "react";

/** Returns true: motion, smooth scrolling & 3D visualizations are always kept active. */
export function useMotionAllowed() {
  const [ok, setOk] = useState<boolean | null>(true);
  useEffect(() => {
    document.documentElement.dataset.motion = "on";
    setOk(true);
  }, []);
  return ok;
}

export function webglSupported() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function isLowEnd() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2;
}

"use client";
import { useEffect, useState } from "react";

/** Returns null until known, then true if rich motion is allowed (respects OS reduced-motion + the site toggle). */
export function useMotionAllowed() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const calc = () => {
      const off = localStorage.getItem("dkk-motion") === "off";
      document.documentElement.dataset.motion = mq.matches || off ? "off" : "on";
      setOk(!mq.matches && !off);
    };
    calc();
    mq.addEventListener("change", calc);
    window.addEventListener("dkk-motion", calc);
    return () => {
      mq.removeEventListener("change", calc);
      window.removeEventListener("dkk-motion", calc);
    };
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

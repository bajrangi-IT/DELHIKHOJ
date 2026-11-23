"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** GSAP ScrollTrigger progress (0–1) across a tall section containing a sticky stage. */
export function useSectionProgress(enabled = true) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled || !sectionRef.current) return;
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        progressRef.current = self.progress;
        setProgress(Math.round(self.progress * 200) / 200);
      },
    });
    return () => {
      clearTimeout(timer);
      st.kill();
    };
  }, [enabled]);

  return { sectionRef, progressRef, progress };
}

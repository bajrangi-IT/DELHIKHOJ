"use client";
import { useEffect, useRef, type MutableRefObject } from "react";

/**
 * Efficient canvas image-sequence renderer.
 * - Works with dense extracted video frames (e.g. 120 WebP frames) or a few keyframe stills (cross-fades).
 * - Lazy: only frames near the current position are requested.
 */
export default function SequenceCanvas({
  frames, progress, className = "", label,
}: { frames: string[]; progress: MutableRefObject<number>; className?: string; label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cache = useRef(new Map<number, HTMLImageElement | "err">());

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = -1;
    let lastW = 0;
    const n = frames.length;

    const load = (i: number) => {
      if (i < 0 || i >= n || cache.current.has(i)) return;
      const img = new Image();
      img.decoding = "async";
      img.onload = () => { last = -1; };
      img.onerror = () => cache.current.set(i, "err");
      img.src = frames[i];
      cache.current.set(i, img);
    };

    const drawCover = (img: HTMLImageElement, alpha: number, zoom: number) => {
      if (!img.complete || !img.naturalWidth) return;
      const cw = cv.width, ch = cv.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * zoom;
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const w = cv.clientWidth;
      if (w !== lastW) {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        cv.width = Math.round(cv.clientWidth * dpr);
        cv.height = Math.round(cv.clientHeight * dpr);
        lastW = w; last = -1;
      }
      const p = progress.current;
      if (Math.abs(p - last) < 0.0004) return;
      last = p;
      const f = p * (n - 1);
      const i = Math.floor(f), t = f - i;
      for (let k = i - 1; k <= i + 3; k++) load(k);
      ctx.fillStyle = "#11100E";
      ctx.fillRect(0, 0, cv.width, cv.height);
      const a = cache.current.get(i), b = cache.current.get(Math.min(i + 1, n - 1));
      const zoom = 1 + t * 0.06;
      if (a && a !== "err") drawCover(a, 1, zoom);
      if (b && b !== "err" && i + 1 < n) drawCover(b, t, 1.06 - (1 - t) * 0.06 + 0);
      ctx.globalAlpha = 1;
    };
    load(0); load(1);
    tick();
    return () => cancelAnimationFrame(raf);
  }, [frames, progress]);

  return <canvas ref={canvas} role="img" aria-label={label} className={className} />;
}

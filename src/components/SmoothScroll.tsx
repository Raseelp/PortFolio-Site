"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";
import { setLenisInstance } from "@/lib/smoothAnchor";

/**
 * Site-wide momentum smooth-scroll, matching the reference site's own
 * `lenis` usage (visible as a `lenis` class on its <html>) — the small
 * follow-through/deceleration feel on wheel and trackpad scroll. Skipped
 * entirely under prefers-reduced-motion, leaving native instant scroll.
 */
export function SmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    setLenisInstance(lenis);

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      setLenisInstance(null);
      lenis.destroy();
    };
  }, [reduce]);

  return null;
}

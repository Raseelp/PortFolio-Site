"use client";

import { motion, useMotionValue, useReducedMotion } from "motion/react";
import type { PointerEvent, ReactNode } from "react";

const BLOBS = [
  { color: "#12b8a0", top: "-10%", left: "4%", size: 420, delay: "0s", duration: "18s" },
  { color: "#ff6b4a", top: "6%", left: "58%", size: 480, delay: "-4s", duration: "21s" },
  { color: "#ffb627", top: "48%", left: "-6%", size: 380, delay: "-9s", duration: "24s" },
  { color: "#8b5cf6", top: "52%", left: "62%", size: 360, delay: "-13s", duration: "19s" },
];

/**
 * Colorful animated blob field, the hero's signature energetic moment.
 * Pointer-reactive glow layered on top tracks the cursor via a Motion
 * value bound directly to a CSS custom property, so movement never
 * triggers a React re-render (design-taste-frontend skill, 3.B).
 */
export function HeroGlow({ children }: { children: ReactNode }) {
  const mx = useMotionValue(74);
  const my = useMotionValue(18);
  const reduce = useReducedMotion();

  function handlePointerMove(e: PointerEvent<HTMLElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 100);
    my.set(((e.clientY - rect.top) / rect.height) * 100);
  }

  return (
    <section
      id="top"
      onPointerMove={handlePointerMove}
      className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden pt-16 pb-20 md:pt-24"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        {BLOBS.map((blob, i) => (
          <div
            key={i}
            className="blob-animate absolute rounded-full"
            style={{
              top: blob.top,
              left: blob.left,
              width: blob.size,
              height: blob.size,
              background: blob.color,
              opacity: 0.32,
              filter: "blur(90px)",
              animationDelay: blob.delay,
              animationDuration: blob.duration,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-white/35" />
      </div>

      {/* Cursor-reactive highlight, riding above the blob field. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          ["--mx" as string]: mx,
          ["--my" as string]: my,
          backgroundImage:
            "radial-gradient(560px circle at var(--mx) var(--my), rgba(255,255,255,0.55), transparent 62%)",
        } as React.CSSProperties}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,22,26,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(20,22,26,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(60% 55% at 70% 30%, black, transparent)",
          WebkitMaskImage:
            "radial-gradient(60% 55% at 70% 30%, black, transparent)",
        }}
      />
      {children}
    </section>
  );
}

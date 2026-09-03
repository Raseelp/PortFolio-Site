"use client";

import { useReducedMotion } from "motion/react";

const LAYERS = 8;
const HEIGHT_REM = 10;
const MAX_BLUR = 22;

/**
 * A progressive blur scrim pinned to the very bottom of the viewport,
 * matching the reference site's fixed "gradual-blur" strip.
 *
 * Each layer covers the bottom `(LAYERS-i)/LAYERS` of the strip and fades
 * to transparent at its own edge — so layer 0 reaches all the way to the
 * top (with a barely-there blur) while the last layer only reaches a
 * sliver near the bottom (with the strongest blur). Every layer's mask is
 * fully opaque starting at 0% (the true bottom edge), so blur is heaviest
 * and continuous right up to the edge — no unblurred sliver below it —
 * and it smoothly unblurs on the way up to nothing at the strip's top.
 */
export function GradualBlur() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  const round = (n: number) => Math.round(n * 100) / 100;
  const step = 100 / LAYERS;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40"
      style={{ height: `${HEIGHT_REM}rem` }}
    >
      {Array.from({ length: LAYERS }).map((_, i) => {
        const coverage = round(100 - (i / LAYERS) * 100); // 100% for i=0, shrinking toward the bottom for higher i
        const featherStart = round(Math.max(coverage - step, 0));
        const blur = round(MAX_BLUR * Math.pow((i + 1) / LAYERS, 2));
        const mask = `linear-gradient(to top, black 0%, black ${featherStart}%, transparent ${coverage}%)`;
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
    </div>
  );
}

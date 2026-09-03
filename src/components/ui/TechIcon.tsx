"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { TECH_ICON_PATHS, type TechIconSlug } from "@/lib/techIcons";
import { usePointerPhysics } from "@/lib/usePointerPhysics";

/**
 * Small brand mark rendered with currentColor, so it always inherits the
 * chip's own text color rather than showing up as a mismatched logo
 * showcase (Color Consistency Lock — one accent, tinted by context).
 *
 * Every instance of this component, wherever it's used across the site
 * (Browse tree, tech-stack chips, experience header, the Try-it toggle),
 * gently pushes away from the cursor as it nears — one real component, so
 * the effect is automatically everywhere a real brand icon renders, not
 * something re-wired per call site.
 */
export function TechIcon({
  slug,
  size = 14,
  className,
}: {
  slug: TechIconSlug;
  size?: number;
  className?: string;
}) {
  const paths = TECH_ICON_PATHS[slug];
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  usePointerPhysics(ref, !reduce, "repel", 55, 14);

  if (!paths) return null;

  return (
    <span ref={ref} className="inline-flex transition-transform duration-300 ease-out">
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden className={className}>
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    </span>
  );
}

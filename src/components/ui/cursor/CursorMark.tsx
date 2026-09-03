"use client";

import { motion, type MotionValue } from "motion/react";
import { TECH_ICON_PATHS } from "@/lib/techIcons";

// The real Flutter mark (Simple Icons, MIT) — the same path data already
// used in the tech-stack chips, reused here as the cursor's signature.
export const FLUTTER_PATH = TECH_ICON_PATHS.flutter[0];

interface CursorMarkProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  rotate?: MotionValue<number>;
  hidden?: boolean;
}

/** The one constant across every cursor variant: the Flutter chevron mark itself. */
export function CursorMark({ x, y, rotate, hidden }: CursorMarkProps) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 24 24"
      className="pointer-events-none fixed left-0 top-0 z-[100] h-3.5 w-3.5 text-accent"
      style={{
        x,
        y,
        rotate,
        translateX: "-50%",
        translateY: "-50%",
        opacity: hidden ? 0 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      <path d={FLUTTER_PATH} fill="currentColor" />
    </motion.svg>
  );
}

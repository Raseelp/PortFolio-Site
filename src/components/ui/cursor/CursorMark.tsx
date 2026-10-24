"use client";

import { motion, type MotionValue } from "motion/react";

interface CursorMarkProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  /** Degrees; leans the pointer into the direction of travel. */
  rotate: MotionValue<number>;
  /** Over something clickable: the pointer swells a little. */
  hovering: boolean;
  /** Mouse button is down: the pointer squeezes. */
  pressed: boolean;
}

/**
 * The site's cursor: a yellow pointer arrow with an ink outline, in the
 * shape of a design-tool or collaborator cursor. Its tip sits exactly on the
 * pointer position (the origin is at the tip, so the lean and the scale
 * pivot there rather than swinging the whole arrow around its middle).
 */
export function CursorMark({ x, y, rotate, hovering, pressed }: CursorMarkProps) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 18 24"
      fill="none"
      className="pointer-events-none fixed left-0 top-0 z-[100] -ml-0.5 -mt-0.5 h-[27px] w-5 drop-shadow-[0_3px_3px_rgba(15,16,48,0.28)]"
      style={{ x, y, rotate, transformOrigin: "2px 2px" }}
      animate={{ scale: pressed ? 0.82 : hovering ? 1.3 : 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 22 }}
    >
      <path
        d="M2 2 V19 L6.6 14.8 L10 22 L13.4 20.5 L10 13.4 L16.4 13.2 Z"
        fill="#ffc933"
        stroke="#0f1030"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

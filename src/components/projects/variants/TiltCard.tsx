"use client";

import { useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, motion } from "motion/react";
import type { PointerEvent, ReactNode } from "react";

/** Degrees at full extent — enough to read as a real tilt across a
 * near-full-width card without turning into a gimmicky fisheye effect. */
const MAX_TILT = 5;
const SPRING = { stiffness: 150, damping: 18, mass: 0.6 };

/**
 * Wraps a Selected Works card so it behaves like one rigid plane that
 * bends toward the pointer — rotateX/rotateY tracked from cursor position
 * within the card, smoothed through a spring rather than following the
 * mouse 1:1, so it settles back to flat on pointer leave instead of
 * snapping. The drop shadow shifts opposite the tilt (as if lit from
 * above), which is what actually sells the "bend" as physical rather
 * than just a rotated image.
 */
export function TiltCard({ className, children }: { className?: string; children: ReactNode }) {
  const reduce = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(rawX, SPRING);
  const rotateY = useSpring(rawY, SPRING);

  const shadowX = useTransform(rotateY, [-MAX_TILT, MAX_TILT], [-16, 16]);
  const shadowY = useTransform(rotateX, [-MAX_TILT, MAX_TILT], [16, -16]);
  const boxShadow = useMotionTemplate`${shadowX}px ${shadowY}px 44px -14px rgba(0,0,0,0.55)`;

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    rawX.set((0.5 - relY) * MAX_TILT);
    rawY.set((relX - 0.5) * MAX_TILT);
  }

  function handlePointerLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <motion.div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={reduce ? undefined : { transformPerspective: 1200, rotateX, rotateY, boxShadow }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

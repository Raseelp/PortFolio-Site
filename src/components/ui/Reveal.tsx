"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  once?: boolean;
}

/**
 * Scroll-reveal wrapper. Uses Motion's whileInView (IntersectionObserver under
 * the hood), never a manual scroll listener. Honors prefers-reduced-motion by
 * skipping the animated entry state entirely.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 20,
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.25 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  /** How much of the group must be on screen before it reveals. A tall group
   * (several stacked cards on a phone) can be far taller than the screen, so
   * a fraction like 0.2 may never be reachable; pass "some" for those. */
  amount?: number | "some" | "all";
}

/** Parent for staggered children. Pair with <RevealItem> inside. */
export function RevealGroup({ children, className, stagger = 0.08, amount = 0.2 }: RevealGroupProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  style,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  y?: number;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

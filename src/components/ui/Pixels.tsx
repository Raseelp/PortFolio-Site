"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * A few loose "pixels" of the hero's widget grid escaping its panel: the
 * same rounded tiles the game is made of, set on the same kind of grid,
 * dissolving outward from a corner in blue, pale blue and one or two
 * yellow ones. It is this site's own punctuation (the grid is the Snake
 * board), used sparingly at the corner of a container or after a word. Each
 * tile pops in with a little spring, staggered by its distance from the
 * corner, once when it scrolls into view; reduced motion just shows them.
 *
 * Patterns are rows of characters: Y yellow, B blue, b pale blue, i ink,
 * "." empty. Decoration only, so hidden from assistive tech. `className`
 * positions it and must supply the display (e.g. "hidden md:grid"), so a
 * breakpoint can hide it.
 */
const PATTERNS = {
  // Dissolving diagonal, solid at the bottom-right where it meets a corner.
  corner: ["Y...", "bY..", ".bB.", "..bB"],
  // A smaller scatter for after a heading word.
  trail: ["Y.", "bY", ".B"],
} as const;

const TONES: Record<string, string> = {
  Y: "bg-accent-gold",
  B: "bg-accent",
  b: "bg-accent/25",
  i: "bg-ink",
};

export type PixelPattern = keyof typeof PATTERNS;

export function Pixels({
  pattern,
  className = "",
  delay = 0,
  flip = false,
  cell = 14,
}: {
  pattern: PixelPattern;
  className?: string;
  delay?: number;
  /** Mirror left-right, for a pattern that belongs on a right-hand corner. */
  flip?: boolean;
  /** Tile size in px; the gap is a third of it. */
  cell?: number;
}) {
  const reduce = useReducedMotion();
  const rows = PATTERNS[pattern];
  const cols = rows[0].length;
  const gap = Math.round(cell / 3);

  return (
    <motion.span
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
        gap,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.6 }}
    >
      {rows.flatMap((row, r) =>
        row.split("").map((ch, c) => {
          const key = `${r}-${c}`;
          if (ch === ".") return <span key={key} />;
          return (
            <motion.span
              key={key}
              className={`block ${TONES[ch]}`}
              style={{ width: cell, height: cell, borderRadius: Math.round(cell * 0.32) }}
              variants={{
                hidden: reduce ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 },
                shown: {
                  scale: 1,
                  opacity: 1,
                  transition: reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 520, damping: 17, delay: delay + (rows.length - r + (cols - c)) * 0.07 },
                },
              }}
            />
          );
        }),
      )}
    </motion.span>
  );
}

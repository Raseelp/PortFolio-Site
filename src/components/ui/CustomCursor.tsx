"use client";

import { useEffect, useState } from "react";
import { useMotionValue, useReducedMotion } from "motion/react";
import { CursorMark } from "./cursor/CursorMark";
import { CursorSparks } from "./cursor/CursorSparks";

const INTERACTIVE_SELECTOR =
  "a, button, input, textarea, select, [role='button'], [data-cursor-hover]";

/**
 * The Flutter mark trails a light stream of blue embers as it moves
 * (CursorSparks) and steps aside on hover so the target itself reads
 * clearly. Chosen after comparing five variants live on the site.
 *
 * Only activates for genuine fine-pointer devices (mouse/trackpad), never
 * touch, and is skipped entirely under prefers-reduced-motion. Deferred a
 * tick post-mount (never a lazy useState initializer) to avoid any
 * SSR/hydration mismatch.
 *
 * This is independent of the hero's own pointer-reactive glow/warp and
 * click ripple (see HeroGlow.tsx + ui/Aurora.tsx) — those live on the
 * hero's own pointer handlers and are unaffected by cursor styling.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const reduce = useReducedMotion();

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  useEffect(() => {
    const id = setTimeout(() => {
      setEnabled(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    function handleMove(e: PointerEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
    }
    function handleOver(e: PointerEvent) {
      const target = (e.target as HTMLElement | null)?.closest?.(INTERACTIVE_SELECTOR);
      setHovering(!!target);
    }

    document.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("pointerover", handleOver, { passive: true });
    document.body.classList.add("custom-cursor-active");

    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerover", handleOver);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [enabled, x, y]);

  if (!enabled || reduce) return null;

  return (
    <>
      <CursorSparks />
      <CursorMark x={x} y={y} hidden={hovering} />
    </>
  );
}

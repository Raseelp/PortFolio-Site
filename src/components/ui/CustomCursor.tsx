"use client";

import { useEffect, useState } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { CursorMark } from "./cursor/CursorMark";
import { CursorSparks } from "./cursor/CursorSparks";

const INTERACTIVE_SELECTOR =
  "a, button, input, textarea, select, [role='button'], [data-cursor-hover]";

/**
 * A yellow pointer arrow (CursorMark) that leans into the direction it
 * moves, swells over anything clickable and squeezes on press. It sheds tiny
 * rounded-square crumbs as it travels and bursts them with a ripple ring on
 * a click (CursorSparks).
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
  const [pressed, setPressed] = useState(false);
  const reduce = useReducedMotion();

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const leanTarget = useMotionValue(0);
  const rotate = useSpring(leanTarget, { stiffness: 260, damping: 18 });

  useEffect(() => {
    const id = setTimeout(() => {
      setEnabled(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let settle: ReturnType<typeof setTimeout> | undefined;
    function handleMove(e: PointerEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
      // Lean with horizontal travel, then straighten once the pointer rests.
      leanTarget.set(Math.max(-22, Math.min(22, e.movementX * 1.4)));
      clearTimeout(settle);
      settle = setTimeout(() => leanTarget.set(0), 90);
    }
    const handleDown = () => setPressed(true);
    const handleUp = () => setPressed(false);
    function handleOver(e: PointerEvent) {
      const target = (e.target as HTMLElement | null)?.closest?.(INTERACTIVE_SELECTOR);
      setHovering(!!target);
    }

    document.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("pointerover", handleOver, { passive: true });
    document.addEventListener("pointerdown", handleDown, { passive: true });
    document.addEventListener("pointerup", handleUp, { passive: true });
    document.body.classList.add("custom-cursor-active");

    return () => {
      clearTimeout(settle);
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerover", handleOver);
      document.removeEventListener("pointerdown", handleDown);
      document.removeEventListener("pointerup", handleUp);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [enabled, x, y, leanTarget]);

  if (!enabled || reduce) return null;

  return (
    <>
      <CursorSparks />
      <CursorMark x={x} y={y} rotate={rotate} hovering={hovering} pressed={pressed} />
    </>
  );
}

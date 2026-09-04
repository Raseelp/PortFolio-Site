"use client";

import { useEffect } from "react";
import type { RefObject } from "react";
import { reportPhysicsForce } from "./physicsSound";

/**
 * Pulls ("attract") or pushes ("repel") the referenced element relative to
 * the cursor within `radius`, easing back to rest via a CSS transition (the
 * caller applies `transition-transform`) once the cursor leaves or the
 * effect is disabled. Works on any element that supports inline style +
 * getBoundingClientRect — HTML or SVG alike — which is what lets the same
 * hook drive both the repelling tech icons and the magnetic timeline/branch
 * nodes.
 */
export function usePointerPhysics(
  ref: RefObject<Element | null>,
  enabled: boolean,
  mode: "attract" | "repel",
  radius = 70,
  strength = 12
) {
  useEffect(() => {
    const el = ref.current as HTMLElement | SVGElement | null;
    if (!enabled || !el) return;
    const sign = mode === "attract" ? 1 : -1;

    // Every instance of this hook used to call getBoundingClientRect() (a
    // forced synchronous layout read) on every single pointermove — and
    // there's one instance per rendered tech icon, so a screen with a few
    // dozen icons meant a few dozen forced layout reads per pointer event,
    // including during a touch-scroll on mobile. The element's position
    // only actually changes on scroll or resize, so the rect is cached and
    // only recomputed then — pointermove still updates the pull every
    // frame exactly as before, just against a rect that isn't needlessly
    // re-measured when nothing has moved.
    let rect = (el as Element).getBoundingClientRect();
    let dirty = false;
    function markDirty() {
      dirty = true;
    }
    window.addEventListener("scroll", markDirty, { passive: true, capture: true });
    window.addEventListener("resize", markDirty);

    function onMove(e: PointerEvent) {
      if (dirty) {
        rect = (el as Element).getBoundingClientRect();
        dirty = false;
      }
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * sign;
      const dy = (e.clientY - cy) * sign;
      const dist = Math.hypot(dx, dy);
      if (dist < radius && dist > 0.01) {
        const fraction = 1 - dist / radius;
        const pull = fraction * strength;
        (el as HTMLElement).style.transform = `translate(${(dx / dist) * pull}px, ${(dy / dist) * pull}px)`;
        reportPhysicsForce(mode, fraction);
      } else {
        (el as HTMLElement).style.transform = "";
      }
    }

    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", markDirty, true);
      window.removeEventListener("resize", markDirty);
      (el as HTMLElement).style.transform = "";
    };
  }, [ref, enabled, mode, radius, strength]);
}

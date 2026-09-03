"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useMotionValueEvent, useReducedMotion } from "motion/react";
import type { PointerEvent as ReactPointerEvent } from "react";

// The line itself only takes up this much vertical space in the page's
// layout flow...
const VISUAL_HEIGHT = 56;
// ...but the region listening for the pointer reaches well beyond it in
// both directions, so dragging the curve away from its resting line doesn't
// walk the cursor off the hit-area and cut the pull short — the original
// bug where it "let go" after a small distance, since the curve could bend
// further than the box capturing pointer events actually was.
const HIT_PADDING = 170;
const MAX_PULL = 170;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * A section divider that behaves like a plucked elastic string instead of a
 * plain <hr>: hovering it pulls the line toward the cursor — following both
 * where along its length you are and how far you drag vertically — and it
 * springs back flat, with a little overshoot, once the pointer leaves.
 * Driven entirely by motion values written straight to the SVG path's `d`
 * attribute (no React state, no per-frame re-render), the same imperative
 * pattern the hero's canvas already uses for continuous animation.
 */
export function ElasticDivider() {
  const outerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const widthRef = useRef(0);
  const reduce = useReducedMotion();

  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const springX = useSpring(pullX, { stiffness: 180, damping: 12, mass: 0.4 });
  const springY = useSpring(pullY, { stiffness: 150, damping: 8, mass: 0.4 });

  function draw() {
    const path = pathRef.current;
    const w = widthRef.current;
    if (!path || !w) return;
    const midY = VISUAL_HEIGHT / 2;
    path.setAttribute("d", `M0 ${midY} Q ${springX.get()} ${midY + springY.get()} ${w} ${midY}`);
  }

  useMotionValueEvent(springX, "change", draw);
  useMotionValueEvent(springY, "change", draw);

  useEffect(() => {
    function measure() {
      widthRef.current = outerRef.current?.clientWidth ?? 0;
      draw();
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (outerRef.current) ro.observe(outerRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (reduce) {
    return <div className="h-px w-full bg-border" />;
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const rect = outerRef.current?.getBoundingClientRect();
    if (!rect) return;
    pullX.set(e.clientX - rect.left);
    pullY.set(clamp(e.clientY - rect.top - VISUAL_HEIGHT / 2, -MAX_PULL, MAX_PULL));
  }

  function handlePointerLeave() {
    pullY.set(0);
  }

  return (
    <div ref={outerRef} className="relative w-full" style={{ height: VISUAL_HEIGHT }}>
      {/* Invisible, oversized hit-area — the actual listener. Padded well
          past the line the curve can physically reach so a fast or
          far-reaching drag never slips off the edge mid-pull. */}
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="absolute inset-x-0 touch-none"
        style={{ top: -HIT_PADDING, bottom: -HIT_PADDING }}
      />
      <svg
        width="100%"
        height={VISUAL_HEIGHT}
        className="pointer-events-none absolute inset-0 overflow-visible"
        aria-hidden
      >
        <path ref={pathRef} fill="none" stroke="var(--accent)" strokeOpacity={0.5} strokeWidth={1.5} />
      </svg>
    </div>
  );
}

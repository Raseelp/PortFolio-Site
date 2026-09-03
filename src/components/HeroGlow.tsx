"use client";

import { animate, useMotionValue, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FocusEvent, PointerEvent } from "react";
import { BgWidgetGrid } from "./ui/hero-bg/BgWidgetGrid";
import { HeroTagline } from "./HeroTagline";
import { MobileDPad } from "./ui/MobileDPad";
import { heroQuotes } from "@/lib/content";

type GameMoment = "start" | "gameover" | null;

const QUOTE_INTERVAL_MS = 30000;

/** A different quote than `exclude`, picked at random — falls back to
 * `exclude` itself only if there's nowhere else to go. */
function pickQuoteIndex(exclude: number): number {
  if (heroQuotes.length <= 1) return 0;
  let next = exclude;
  while (next === exclude) next = Math.floor(Math.random() * heroQuotes.length);
  return next;
}

/**
 * The hero's background panel — full viewport height and width, with only
 * a hairline inset margin, not a contained card. The background is a
 * canvas widget-grid (see ui/hero-bg/BgWidgetGrid) scattered with real
 * tech-brand icons: a nod to actual widget composition rather than a
 * nature/gradient metaphor.
 *
 * Hidden in that same grid is a small Snake game (arrow keys/WASD, a swipe,
 * or the on-screen D-pad that only appears on touch devices once a run is
 * actually in progress — see ui/MobileDPad) — deliberately with no
 * scoreboard or "play me" label anywhere; the grid just quietly responds
 * if you try. The one payoff:
 * taking control of a real run, or crashing out of one, hijacks the
 * poetic tagline for a beat with an arcade "GAME ON"/"GAME OVER" callout
 * (see HeroTagline) before it settles back — a reward for finding the
 * game, never an announcement that it exists.
 */
export function HeroGlow() {
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const mouseActive = useMotionValue(0);
  const clickX = useMotionValue(50);
  const clickY = useMotionValue(50);
  const clickStrength = useMotionValue(0);
  const reduce = useReducedMotion();
  // The tagline's letters measure their own position against this same
  // panel — it's what the canvas beneath fills exactly, so a canvas-local
  // pixel and a position measured from this rect are already one
  // coordinate space (see heroDisturbance.ts).
  const panelRef = useRef<HTMLDivElement>(null);

  const [moment, setMoment] = useState<GameMoment>(null);
  const momentTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Index 0 on the server and on the very first client render (so they
  // match exactly — no hydration mismatch), then immediately re-rolled to
  // a genuine random pick once mounted; a static prerendered page can't
  // vary Math.random() per visitor, only per-client-after-hydration can.
  // Every QUOTE_INTERVAL_MS after that, a different random quote fades in.
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    // A genuinely uniform pick — every quote, index 0 included, has an
    // equal shot at being the very first one a visitor sees. Only the
    // *later*, recurring picks need to exclude the current quote (so a
    // 30s tick can't ever "fade" to the exact text already on screen).
    // Deferred a tick (same pattern SoundToggle/SnakeToggle use for their
    // own post-mount state) rather than called synchronously in the effect
    // body, which React flags as a cascading-render risk.
    const id = setTimeout(() => setQuoteIndex(Math.floor(Math.random() * heroQuotes.length)), 0);
    const interval = setInterval(() => {
      setQuoteIndex((current) => pickQuoteIndex(current));
    }, QUOTE_INTERVAL_MS);
    return () => {
      clearTimeout(id);
      clearInterval(interval);
    };
  }, []);

  const handleGameEvent = useCallback((event: "start" | "gameover") => {
    setMoment(event);
    clearTimeout(momentTimeoutRef.current);
    momentTimeoutRef.current = setTimeout(() => setMoment(null), 1600);
  }, []);

  function handlePointerMove(e: PointerEvent<HTMLElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 100);
    my.set(((e.clientY - rect.top) / rect.height) * 100);
  }

  function handlePointerEnter() {
    if (reduce) return;
    animate(mouseActive, 1, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
  }

  function handlePointerLeave() {
    if (reduce) return;
    animate(mouseActive, 0, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
  }

  // Focus arms the exact same signal hover does, so a keyboard-only visitor
  // can Tab to the hero and immediately use arrow keys — not just a mouse
  // hovering it.
  function handleFocus(e: FocusEvent<HTMLElement>) {
    if (reduce || e.target !== e.currentTarget) return;
    animate(mouseActive, 1, { duration: 0.3 });
  }

  function handleBlur(e: FocusEvent<HTMLElement>) {
    if (reduce || e.target !== e.currentTarget) return;
    animate(mouseActive, 0, { duration: 0.3 });
  }

  function handlePointerDown(e: PointerEvent<HTMLElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    clickX.set(((e.clientX - rect.left) / rect.width) * 100);
    clickY.set(((e.clientY - rect.top) / rect.height) * 100);
    clickStrength.stop();
    clickStrength.set(1);
    animate(clickStrength, 0, { duration: 1.4, ease: [0.16, 1, 0.3, 1] });
  }

  return (
    <section id="top" className="relative h-[100dvh] w-full bg-bg">
      <div
        ref={panelRef}
        tabIndex={0}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="absolute inset-3 isolate overflow-hidden rounded-[29px] border border-border bg-[#070c12] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        <div aria-hidden className="absolute inset-0 -z-20">
          <BgWidgetGrid
            mouseX={mx}
            mouseY={my}
            mouseActive={mouseActive}
            clickX={clickX}
            clickY={clickY}
            clickStrength={clickStrength}
            onGameEvent={handleGameEvent}
          />
        </div>

        <div className="relative z-10 flex h-full items-center justify-center p-8 text-center sm:p-14">
          <HeroTagline
            tagline={heroQuotes[quoteIndex]}
            quoteIndex={quoteIndex}
            moment={moment}
            reduceMotion={!!reduce}
            containerRef={panelRef}
          />
        </div>

        <MobileDPad />
      </div>
    </section>
  );
}

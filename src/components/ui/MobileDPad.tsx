"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CaretDown, CaretLeft, CaretRight, CaretUp } from "@phosphor-icons/react";
import { isSnakeActive, onSnakeActiveChange, requestSnakeDirection } from "@/lib/snakeControl";
import type { Direction } from "./hero-bg/snakeGame";

interface PadButtonProps {
  dir: Direction;
  className?: string;
  children: ReactNode;
}

function PadButton({ dir, className, children }: PadButtonProps) {
  return (
    <button
      type="button"
      onPointerDown={(e) => {
        // Real button semantics (onClick) still work, but a touch's own
        // ~pointerdown-to-click gap is exactly the kind of lag a game
        // control shouldn't have — react on pointerdown instead. Doesn't
        // suppress the click that still follows, so nothing double-fires
        // since setDirection() is idempotent for a repeated direction.
        // stopPropagation matters here specifically: this button lives
        // inside the hero panel, whose own onPointerDown fires the click
        // ripple/splash — a D-pad press is steering, not a tap on the
        // grid, so it shouldn't also ripple.
        e.preventDefault();
        e.stopPropagation();
        requestSnakeDirection(dir);
      }}
      aria-label={`Move ${dir}`}
      className={`liquid-glass flex h-11 w-11 items-center justify-center rounded-2xl text-fg/80 transition-colors active:text-accent ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

/**
 * Touch-only steering for Snake — arrow keys have no equivalent on a phone,
 * and a swipe-to-steer gesture (still there, unchanged) doesn't announce
 * itself the way a visible control does. Three conditions all have to be
 * true at once: a touch-primary device (checked once via matchMedia, same
 * deferred-to-post-mount pattern CustomCursor uses, so this can never be
 * the thing that causes a hydration mismatch), a run actually in progress
 * (see snakeControl.ts), and — since this renders inside the hero panel
 * itself rather than fixed to the viewport — physically within the hero,
 * so it scrolls away with the game instead of following the visitor down
 * the rest of the page.
 */
export function MobileDPad() {
  const [isTouch, setIsTouch] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setIsTouch(window.matchMedia("(pointer: coarse)").matches);
      setActive(isSnakeActive());
    }, 0);
    const unsubscribe = onSnakeActiveChange(setActive);
    return () => {
      clearTimeout(id);
      unsubscribe();
    };
  }, []);

  if (!isTouch || !active) return null;

  return (
    <div
      aria-hidden={false}
      // z-50 — matches the fixed nav/toggle buttons' own top tier, and
      // critically sits *above* GradualBlur's z-40 fixed scrim: that scrim
      // covers the bottom 10rem of the whole viewport, which this D-pad's
      // position otherwise falls inside, and backdrop-filter only samples
      // what's painted behind it in stacking order — being above it is
      // what keeps the pad crisp instead of hazed over right where it
      // needs to be tapped precisely.
      className="absolute bottom-10 left-1/2 z-50 grid -translate-x-1/2 grid-cols-3 grid-rows-3 gap-1.5 [touch-action:none]"
    >
      <PadButton dir="up" className="col-start-2 row-start-1">
        <CaretUp size={18} weight="bold" />
      </PadButton>
      <PadButton dir="left" className="col-start-1 row-start-2">
        <CaretLeft size={18} weight="bold" />
      </PadButton>
      <PadButton dir="right" className="col-start-3 row-start-2">
        <CaretRight size={18} weight="bold" />
      </PadButton>
      <PadButton dir="down" className="col-start-2 row-start-3">
        <CaretDown size={18} weight="bold" />
      </PadButton>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { isSnakeActive, onSnakeActiveChange, requestSnakeStart, requestSnakeStop } from "@/lib/snakeControl";
import { playClick } from "@/lib/sound";
import { smoothScrollToHash } from "@/lib/smoothAnchor";

// A small staircase of blocks — the same grid-cell language the real game
// is drawn in (see BgWidgetGrid.tsx), read instantly as "Snake" rather than
// a generic wavy line. Icon never swaps to a separate "stop" symbol —
// same convention TogglePreview.tsx uses: it animates and turns
// accent-colored under one condition (running, or hovered as a preview),
// so "this is playing" and "this is accent-colored" always agree.
const SNAKE_BLOCKS = [
  { x: 2, y: 2 },
  { x: 2, y: 9 },
  { x: 9, y: 9 },
  { x: 9, y: 16 },
  { x: 16, y: 16 },
];

function SnakeIcon({ playState }: { playState: string }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
      {SNAKE_BLOCKS.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={6}
          height={6}
          rx={1.5}
          className={playState}
          style={{
            transformOrigin: `${b.x + 3}px ${b.y + 3}px`,
            // Longhand only — see TogglePreview.tsx's own note: the
            // `animation` shorthand resets animation-play-state to
            // "running", silently overriding the play-state classes since
            // inline styles win over classes.
            animationName: "tech-toggle-grid-pulse",
            animationDuration: "1s",
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: `${i * -0.15}s`,
          }}
        />
      ))}
    </svg>
  );
}

/**
 * The explicit "play Snake" control, next to the sound toggle — Snake is
 * off by default and stays off until this is pressed (see
 * snakeControl.ts). Replaces the earlier design of arming on first arrow
 * key/swipe: that only worked if someone already knew to try it, which
 * doesn't hold up on touch devices, so this button both reveals the game
 * and arms a real run in the same press, and stops it again on a second
 * press. Arrow keys/WASD/swipe still steer once it's running.
 */
export function SnakeToggle() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setActive(isSnakeActive()), 0);
    const unsubscribe = onSnakeActiveChange(setActive);
    return () => {
      clearTimeout(id);
      unsubscribe();
    };
  }, []);

  function handleClick() {
    playClick();
    if (active) {
      requestSnakeStop();
    } else {
      // The button is fixed and visible from anywhere on the page, but the
      // game itself only exists inside the hero — starting it from
      // scrolled-away content would arm a run nobody can see.
      smoothScrollToHash("#top");
      requestSnakeStart();
    }
  }

  const playState = active
    ? "[animation-play-state:running]"
    : "[animation-play-state:paused] group-hover:[animation-play-state:running]";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "Stop Snake" : "Play Snake"}
      aria-pressed={active}
      title={active ? "Stop Snake" : "There's a hidden Snake game in the grid above — click to play"}
      className={`liquid-glass group fixed left-[4.75rem] top-5 z-50 flex h-11 w-11 items-center justify-center rounded-[22px] transition-colors duration-300 ${
        active ? "text-accent" : "text-fg-muted hover:text-accent"
      }`}
      // Same fix as SoundToggle: a real tint behind the blur so scrolled-in
      // content reads as a soft dark blur instead of showing through legibly.
      style={{ background: "color-mix(in srgb, var(--bg) 78%, transparent)" }}
    >
      <SnakeIcon playState={playState} />
    </button>
  );
}

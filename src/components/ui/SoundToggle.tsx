"use client";

import { useEffect, useState } from "react";
import { isSoundEnabled, playClick, toggleSound } from "@/lib/sound";
import { startMusic } from "@/lib/music";
import { refreshAmbientGain, startAmbient } from "@/lib/ambient";
import { startPhysicsSound } from "@/lib/physicsSound";

// A speaker body that's always there, plus two sound-wave arcs that only
// exist (and pulse) while enabled — a small, centered "X" takes their
// exact place when muted (the standard volume-x shape), rather than one
// long diagonal drawn corner-to-corner across the whole 24×24 box, which
// only lined up with the off-center speaker glyph by accident and read as
// lopsided. Same convention as TogglePreview.tsx and SnakeToggle.tsx: it
// animates and turns accent-colored under one condition (enabled, or
// hovered as a preview), so "this is on" and "this is accent-colored"
// always agree.
function SoundIcon({ enabled, playState }: { enabled: boolean; playState: string }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" aria-hidden>
      <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
      {enabled ? (
        <>
          <path
            d="M16.2 9a5 5 0 0 1 0 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className={playState}
            style={{
              transformOrigin: "15px 12px",
              animationName: "tech-toggle-grid-pulse",
              animationDuration: "1.1s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: "0s",
            }}
          />
          <path
            d="M19.2 6.5a9 9 0 0 1 0 11"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className={playState}
            style={{
              transformOrigin: "17px 12px",
              animationName: "tech-toggle-grid-pulse",
              animationDuration: "1.1s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: "-0.35s",
            }}
          />
        </>
      ) : (
        <>
          <line x1="14.5" y1="8.5" x2="21.5" y2="15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="21.5" y1="8.5" x2="14.5" y2="15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/**
 * The only visible acknowledgment that this site makes sound at all — off
 * by default (see sound.ts), so this is how someone opts in. Server and the
 * first client render both start from `false`, matching exactly; the real
 * (possibly-true, from localStorage) value only lands after mount, which is
 * a normal post-hydration update, not a mismatch.
 */
export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      const wasEnabled = isSoundEnabled();
      setEnabled(wasEnabled);
      // A returning visitor who already had sound on — start the clock now;
      // actual audio still waits on the browser's autoplay gate, which the
      // next real interaction anywhere on the page satisfies (see sound.ts).
      if (wasEnabled) {
        startMusic();
        startAmbient();
        startPhysicsSound();
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  function handleClick() {
    const next = toggleSound();
    setEnabled(next);
    if (next) {
      playClick();
      startMusic();
      startAmbient();
      startPhysicsSound();
    } else {
      refreshAmbientGain();
    }
  }

  const playState = enabled
    ? "[animation-play-state:running]"
    : "[animation-play-state:paused] group-hover:[animation-play-state:running]";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={enabled ? "Mute sound" : "Enable sound"}
      aria-pressed={enabled}
      title={enabled ? "Mute sound" : "This site has a few sound effects — click to enable"}
      className={`liquid-glass group fixed left-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-[22px] transition-colors duration-300 ${
        enabled ? "text-accent" : "text-fg-muted hover:text-accent"
      }`}
      // liquid-glass's own background is fully transparent (blur only, no
      // tint) — fine floating over the hero's controlled dark backdrop, but
      // this button is fixed and stays over whatever page content scrolls
      // underneath it, and bright headings were showing through as a messy
      // legible-ish blur. A real tint (inline so it beats the class's own
      // background rule) is what actual frosted glass needs to read as
      // "glass over content" instead of "content with a blur filter on it."
      style={{ background: "color-mix(in srgb, var(--bg) 78%, transparent)" }}
    >
      <SoundIcon enabled={enabled} playState={playState} />
    </button>
  );
}

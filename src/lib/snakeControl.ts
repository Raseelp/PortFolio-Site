"use client";

import type { Direction } from "@/components/ui/hero-bg/snakeGame";

/**
 * A tiny pub-sub bridge between SnakeToggle.tsx (lives in the site-wide
 * layout, next to the sound toggle) and the actual game instance inside
 * BgWidgetGrid.tsx (lives inside the hero, mounted separately) — there's
 * only ever one hero/game on this single-page site, so a module-singleton
 * bridge is simpler than threading a prop the long way down through
 * Hero → HeroGlow → BgWidgetGrid, and matches the same singleton-module
 * pattern sound.ts/music.ts already use for page-wide audio state.
 *
 * Snake is off by default and stays off until this is used to turn it on —
 * no ambient idle wandering, nothing to stumble onto by accident.
 */
type Listener = () => void;

let active = false;
const startListeners = new Set<Listener>();
const stopListeners = new Set<Listener>();
const activeChangeListeners = new Set<(active: boolean) => void>();
const directionListeners = new Set<(dir: Direction) => void>();

export function isSnakeActive() {
  return active;
}

/** Called by BgWidgetGrid to react to the toggle button. Returns an
 * unsubscribe function for its effect cleanup. */
export function onSnakeStartRequested(fn: Listener) {
  startListeners.add(fn);
  return () => startListeners.delete(fn);
}

export function onSnakeStopRequested(fn: Listener) {
  stopListeners.add(fn);
  return () => stopListeners.delete(fn);
}

/** Called by BgWidgetGrid so SnakeToggle's own icon/label stays in sync
 * even when the game stops itself (e.g. auto-stopping after a game over). */
export function onSnakeActiveChange(fn: (active: boolean) => void) {
  activeChangeListeners.add(fn);
  return () => activeChangeListeners.delete(fn);
}

function setActive(next: boolean) {
  if (next === active) return;
  active = next;
  activeChangeListeners.forEach((fn) => fn(active));
}

/** Called by SnakeToggle on click, and by BgWidgetGrid itself when a run
 * ends on its own (collision) so the button's state stays truthful. */
export function requestSnakeStart() {
  setActive(true);
  startListeners.forEach((fn) => fn());
}

export function requestSnakeStop() {
  setActive(false);
  stopListeners.forEach((fn) => fn());
}

/** Called by BgWidgetGrid to react to the on-screen mobile D-pad, the same
 * way it already reacts to keyboard/swipe. */
export function onSnakeDirectionRequested(fn: (dir: Direction) => void) {
  directionListeners.add(fn);
  return () => directionListeners.delete(fn);
}

/** Called by the mobile D-pad — MobileDPad.tsx. */
export function requestSnakeDirection(dir: Direction) {
  directionListeners.forEach((fn) => fn(dir));
}

"use client";

/**
 * A tiny bridge from the hero's canvas (BgWidgetGrid.tsx — the click ripple
 * and the Snake game) to the DOM text layer sitting on top of it
 * (HeroTagline.tsx) — so the tagline's own letters can react to both as if
 * they were physical obstacles. The canvas and the text layer are both
 * absolutely positioned to fill the exact same hero panel (see
 * HeroGlow.tsx), so a canvas-local pixel coordinate and a DOM position
 * measured from that panel's own top-left are already the same coordinate
 * space — no conversion needed, just a place to hand the numbers across.
 *
 * Plain module-level state, not a subscription — HeroTagline polls this
 * once per animation frame of its own rather than re-rendering on every
 * report, since there's only ever one hero on this page.
 */
export interface RippleState {
  cx: number;
  cy: number;
  waveFront: number;
  ringWidth: number;
  /** 0..1, how strong the ring still is — fades out over the click's life. */
  strength: number;
}

export interface DisturbancePoint {
  x: number;
  y: number;
}

let ripple: RippleState | null = null;
let snakeSegments: DisturbancePoint[] = [];

export function reportRipple(state: RippleState | null) {
  ripple = state;
}

export function getRipple(): RippleState | null {
  return ripple;
}

export function reportSnakeSegments(segments: DisturbancePoint[]) {
  snakeSegments = segments;
}

export function getSnakeSegments(): DisturbancePoint[] {
  return snakeSegments;
}

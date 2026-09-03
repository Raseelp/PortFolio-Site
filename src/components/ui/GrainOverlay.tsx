/**
 * Fixed, full-viewport static noise texture (see `.grain-overlay` in
 * globals.css). Purely decorative — never intercepts clicks, never
 * animates, so it costs nothing and needs no reduced-motion handling.
 */
export function GrainOverlay() {
  return <div aria-hidden className="grain-overlay pointer-events-none fixed inset-0 z-[90]" />;
}

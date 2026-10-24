"use client";

import type { View } from "../TechStackTypes";

/**
 * Two buttons whose icons are small live previews of what they switch to
 * — three dots looping in a line for Flow, a 2x2 grid that pulses for
 * Browse — rather than generic symbols. Each icon animates AND turns
 * accent-colored under the exact same condition: hovered OR currently
 * selected. Both signals move together on purpose, so "this one is
 * running" and "this one is accent-colored" never disagree.
 */
export function TogglePreview({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const flowActive = view === "flow";
  const browseActive = view === "browse";

  const flowPlayState = flowActive
    ? "[animation-play-state:running]"
    : "[animation-play-state:paused] group-hover:[animation-play-state:running]";
  const browsePlayState = browseActive
    ? "[animation-play-state:running]"
    : "[animation-play-state:paused] group-hover:[animation-play-state:running]";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange("flow")}
        aria-pressed={flowActive}
        aria-label="Flow view"
        className={`group flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-[var(--shadow-card)] ring-1 ring-black/[0.05] transition-[color,transform] hover:-translate-y-0.5 active:scale-95 ${
          flowActive ? "text-accent-deep ring-accent/60" : "text-fg-muted hover:text-fg"
        }`}
      >
        <span className="relative block h-3 w-6 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`absolute top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-current ${flowPlayState}`}
              style={{
                // Longhand properties only — the `animation` shorthand would
                // reset animation-play-state to its default (running),
                // silently overriding the play-state classes above since
                // inline styles always win specificity.
                animationName: "tech-toggle-flow",
                animationDuration: "1.6s",
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
                animationDelay: `${i * -0.53}s`,
              }}
            />
          ))}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChange("browse")}
        aria-pressed={browseActive}
        aria-label="Browse view"
        className={`group flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[var(--shadow-card)] ring-1 ring-black/[0.05] transition-[color,transform] hover:-translate-y-0.5 active:scale-95 ${
          browseActive ? "text-accent-deep ring-accent/60" : "text-fg-muted hover:text-fg"
        }`}
      >
        <span className="grid grid-cols-2 gap-[3px]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-[5px] w-[5px] rounded-[1.5px] bg-current ${browsePlayState}`}
              style={{
                animationName: "tech-toggle-grid-pulse",
                animationDuration: "1.2s",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${i * -0.15}s`,
              }}
            />
          ))}
        </span>
      </button>
    </div>
  );
}

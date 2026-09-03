"use client";

import { TogglePreview } from "./toggle/TogglePreview";
import type { View } from "./TechStackTypes";

/** Switches between the Flow (marquee) and Browse (categorized) views. */
export function TechStackViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return <TogglePreview view={view} onChange={onChange} />;
}

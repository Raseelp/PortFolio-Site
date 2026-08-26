"use client";

import dynamic from "next/dynamic";
import type { DemoImage } from "@/lib/demoImages";

// Three.js is heavy — isolated in its own client leaf and lazy-loaded so it
// never blocks the initial paint of the rest of the page.
const EmbeddingVisualizer = dynamic(
  () => import("./EmbeddingVisualizer").then((mod) => mod.EmbeddingVisualizer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-accent-warm/20" />
      </div>
    ),
  }
);

interface VisualizerLoaderProps {
  highlightedIds: string[];
  onSelect?: (image: DemoImage | null) => void;
}

export function VisualizerLoader({ highlightedIds, onSelect }: VisualizerLoaderProps) {
  return <EmbeddingVisualizer highlightedIds={highlightedIds} onSelect={onSelect} />;
}

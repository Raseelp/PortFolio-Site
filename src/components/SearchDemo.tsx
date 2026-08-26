"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { VisualizerLoader } from "./VisualizerLoader";
import {
  categoryMeta,
  demoImages,
  demoQuerySuggestions,
  imageUrl,
  type DemoImage,
} from "@/lib/demoImages";
import { runDemoSearch } from "@/lib/searchDemo";

export function SearchDemo() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DemoImage | null>(null);

  const results = useMemo(() => runDemoSearch(query), [query]);
  const highlightedIds = useMemo(() => results.map((r) => r.image.id), [results]);
  const hasQuery = query.trim().length > 0;

  return (
    <div className="demo-stage glass-shell p-1.5 md:p-2">
      <div className="glass-core glass-blur overflow-hidden">
        <div className="border-b border-border p-5 md:p-6">
          <p className="text-[13px] font-medium text-fg">
            Try it: search these demo photos in plain language
          </p>
          <div className="relative mt-4">
            <MagnifyingGlass
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-faint"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try: dog in the park"
              className="w-full rounded-full border border-border-strong bg-white/[0.03] py-3 pl-11 pr-11 text-[15px] text-fg placeholder:text-fg-faint outline-none transition-colors focus:border-accent-warm-soft-border focus:bg-white/[0.05]"
            />
            {hasQuery && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-fg-faint transition-colors hover:bg-white/[0.06] hover:text-fg"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {demoQuerySuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="rounded-full border border-border bg-white/[0.02] px-3.5 py-1.5 text-[13px] text-fg-muted transition-colors hover:border-accent-warm-soft-border hover:text-fg"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4">
            {Object.entries(categoryMeta).map(([key, meta]) => (
              <span key={key} className="flex items-center gap-1.5 text-[11px] text-fg-faint">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                {meta.label}
              </span>
            ))}
            <span className="text-[11px] text-fg-faint">
              {demoImages.length} demo photos
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="order-2 md:order-1 md:col-span-5 md:border-r md:border-border">
            <div className="h-[280px] overflow-y-auto p-4 md:h-[460px] md:p-5">
              {!hasQuery && (
                <p className="px-1 py-6 text-[14px] leading-relaxed text-fg-faint">
                  Type a query above, or tap a suggestion, to search the 18
                  demo photos scattered through the space on the right.
                </p>
              )}
              {hasQuery && results.length === 0 && (
                <p className="px-1 py-6 text-[14px] leading-relaxed text-fg-faint">
                  No matches for that phrase in this small demo set. Try one
                  of the suggestions above.
                </p>
              )}
              <AnimatePresence mode="popLayout">
                {results.map((result, i) => (
                  <motion.button
                    key={result.image.id}
                    type="button"
                    onClick={() => setSelected(result.image)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className={`mb-2.5 flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-colors ${
                      selected?.id === result.image.id
                        ? "border-accent-warm-soft-border bg-accent-warm-soft"
                        : "border-transparent bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <Image
                      src={imageUrl(result.image.seed, 96)}
                      alt={result.image.caption}
                      width={48}
                      height={48}
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] text-fg">{result.image.caption}</p>
                      <span
                        className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-fg-faint"
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: categoryMeta[result.image.category].color }}
                        />
                        {categoryMeta[result.image.category].label}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="order-1 md:order-2 md:col-span-7">
            <div className="h-[320px] md:h-[460px]">
              <VisualizerLoader highlightedIds={highlightedIds} onSelect={setSelected} />
            </div>
          </div>
        </div>

        <div className="border-t border-border px-5 py-4 md:px-6">
          {selected ? (
            <p className="text-[13px] leading-relaxed text-fg-muted">
              <span className="text-fg">{selected.caption}.</span> Tagged{" "}
              {selected.tags.slice(0, 4).join(", ")}.
            </p>
          ) : (
            <p className="text-[13px] leading-relaxed text-fg-faint">
              Drag to rotate the space, or click any photo to inspect it. This
              runs a small keyword match in your browser to demonstrate the
              interaction, the real app runs CLIP inference on-device instead.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

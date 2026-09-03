"use client";

import { Children, cloneElement, isValidElement, useRef } from "react";
import type { ReactElement, ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { RevealGroup, RevealItem } from "./Reveal";
import { usePointerPhysics } from "@/lib/usePointerPhysics";

interface TimelineEntryProps {
  date: string;
  title: string;
  org: string;
  location?: string;
  children?: ReactNode;
  /**
   * Full-width content rendered below the date/title grid, pulled back by
   * the same amount as the entry's own left padding so its x:0 lines up
   * with the entry's marker instead of the grid's content column — used by
   * Work Experience to hang a branching sub-timeline directly off this
   * entry's own diamond rather than off-center inside the text column.
   */
  belowFull?: ReactNode;
  isLast?: boolean;
  isFirst?: boolean;
}

/**
 * One dated stop on a Timeline. Shared by Work Experience and Education per
 * design.md. Markers follow the reference site exactly: every past entry is
 * a solid light diamond, the single most-recent entry (first in the list)
 * is a pulsing lime diamond.
 */
export function TimelineEntry({
  date,
  title,
  org,
  location,
  children,
  belowFull,
  isLast,
  isFirst,
}: TimelineEntryProps) {
  const reduce = useReducedMotion();
  const markerRef = useRef<HTMLSpanElement>(null);
  // The marker's own rotate/scale (static, or the pulsing keyframe) lives on
  // the inner span; magnetism translates the outer wrapper instead, since an
  // inline `transform` on the SAME element would replace — not combine
  // with — the animated one (the exact `animation` shorthand gotcha this
  // codebase already hit once, just via `transform` instead of the
  // shorthand).
  usePointerPhysics(markerRef, !reduce, "attract", 65, 9);

  return (
    <RevealItem className={`relative pl-9 md:pl-12 ${isLast ? "" : "pb-12 md:pb-14"}`}>
      <span ref={markerRef} className="absolute left-0 top-1 z-10 inline-block transition-transform duration-300 ease-out">
        <span
          aria-hidden
          className={isFirst ? "timeline-pulse block h-3 w-3 bg-accent" : "block h-3 w-3 rotate-45 bg-fg"}
        />
      </span>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-3">
          <p className="text-[13px] italic text-fg-faint">{date}</p>
          {location && <p className="mt-1 text-[13px] text-fg-faint">{location}</p>}
        </div>
        <div className="md:col-span-9">
          <h3 className="text-[17px] font-bold tracking-tight text-fg">{title}</h3>
          <p className="mt-0.5 text-[14px] font-medium text-fg-muted">{org}</p>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
      {belowFull && <div className="-ml-9 mt-5 md:-ml-12">{belowFull}</div>}
    </RevealItem>
  );
}

/**
 * Wraps a run of <TimelineEntry>s with ONE continuous connecting line
 * (rather than a per-entry segment), so the reference site's signature
 * lime-to-white-to-transparent fade reads as a single unbroken gradient
 * down the whole timeline.
 */
export function Timeline({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<TimelineEntryProps>[];

  return (
    <div className="relative">
      <span
        aria-hidden
        className="absolute bottom-6 left-[5px] top-1.5 w-px"
        style={{
          background:
            "linear-gradient(180deg, var(--accent) 0%, var(--fg) 40%, var(--fg) 60%, var(--bg) 99%)",
        }}
      />
      <RevealGroup className="flex flex-col">
        {items.map((child, i) =>
          cloneElement(child, { isLast: i === items.length - 1, isFirst: i === 0 })
        )}
      </RevealGroup>
    </div>
  );
}

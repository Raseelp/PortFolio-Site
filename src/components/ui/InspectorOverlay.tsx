"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A "widget inspector" selection box: when the pointer is over the parent,
 * a dashed outline sits just outside it, four square handles mark the
 * corners and a small tag on the top edge names the block with its real,
 * measured size (Card · 1120 × 360), as in Flutter DevTools. The parent needs
 * the `insp-host` class and `position: relative`. Only fades in on devices
 * that can hover; invisible and inert otherwise. Border colours are inline
 * because the global `* { border-color }` rule outranks utility classes.
 */
export function InspectorOverlay({
  label,
  tagSide = "left",
}: {
  label: string;
  /** Which end of the top edge the tag sits on, to stay clear of neighbours. */
  tagSide?: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<string | null>(null);

  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    const measure = () => {
      const r = host.getBoundingClientRect();
      setSize(`${Math.round(host.offsetWidth || r.width)} × ${Math.round(host.offsetHeight || r.height)}`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="insp pointer-events-none absolute -inset-2.5 z-20 rounded-[2.4rem] border-[1.5px] border-dashed" style={{ borderColor: "var(--accent)" }}>
      {["-left-[5px] -top-[5px]", "-right-[5px] -top-[5px]", "-left-[5px] -bottom-[5px]", "-right-[5px] -bottom-[5px]"].map((pos) => (
        <span key={pos} className={`absolute h-2.5 w-2.5 border-[1.5px] bg-white ${pos}`} style={{ borderColor: "var(--accent)" }} />
      ))}
      <span
        className={`absolute top-0 -translate-y-1/2 whitespace-nowrap rounded-[5px] bg-accent px-2 py-1 font-mono text-[11px] font-semibold leading-none text-white ${
          tagSide === "left" ? "left-8" : "right-8"
        }`}
      >
        {size ? `${label} · ${size}` : label}
      </span>
    </div>
  );
}

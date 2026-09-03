"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { PointerEvent as ReactPointerEvent } from "react";
import QRCode from "qrcode";
import { QrCode, ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { TechIcon } from "../ui/TechIcon";
import { TECH_BRAND_COLORS } from "@/lib/techIcons";

type Platform = "playStore" | "appStore";

/** Renders a real, scannable QR code from scratch — no image request, no
 * third-party QR API. `qrcode`'s `create()` is a pure computation (an
 * error-correction-coded module matrix); this just walks that matrix into
 * SVG rects tinted with the page's own ink color instead of generic black. */
function QRSvg({ value, size = 108 }: { value: string; size?: number }) {
  const path = useMemo(() => {
    const { modules } = QRCode.create(value, { errorCorrectionLevel: "M" });
    const count = modules.size;
    const quiet = 2;
    const cell = size / (count + quiet * 2);
    let d = "";
    for (let y = 0; y < count; y++) {
      for (let x = 0; x < count; x++) {
        if (modules.data[y * count + x]) {
          const px = (x + quiet) * cell;
          const py = (y + quiet) * cell;
          d += `M${px} ${py}h${cell}v${cell}h${-cell}z`;
        }
      }
    }
    return d;
  }, [value, size]);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden>
      <rect width={size} height={size} rx={6} fill="#fff" />
      <path d={path} fill="var(--bg)" />
    </svg>
  );
}

/**
 * Replaces the generic store-badge banners with something a portfolio
 * visitor can actually act on: a "Try it" trigger — styled with the same
 * accent-glow, fills-solid-on-hover language as the site's one real CTA
 * ("Email me"), so it actually reads as a button — that reveals a real QR
 * code pointed at the real store listing, framed like a scanner viewfinder
 * so the "point your camera here" affordance is visual, not just implied.
 */
export function TryItQR({
  appName,
  playStore,
  appStore,
}: {
  appName: string;
  playStore?: string;
  appStore?: string;
}) {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>(playStore ? "playStore" : "appStore");
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const magnetic = !reduce;
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  function handleButtonPointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!magnetic) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(Math.max(-6, Math.min(6, (e.clientX - rect.left - rect.width / 2) * 0.3)));
    my.set(Math.max(-5, Math.min(5, (e.clientY - rect.top - rect.height / 2) * 0.35)));
  }

  function handleButtonPointerLeave() {
    mx.set(0);
    my.set(0);
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!playStore && !appStore) return null;

  const url = (platform === "playStore" ? playStore : appStore) ?? playStore ?? appStore ?? "";
  const hasBoth = Boolean(playStore && appStore);
  const shortName = appName.split(",")[0].trim();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onPointerMove={handleButtonPointerMove}
        onPointerLeave={handleButtonPointerLeave}
        aria-expanded={open}
        aria-label={`Try ${appName}`}
        className={`group inline-flex items-center gap-2 rounded-full border py-1 pl-3 pr-1 text-[12px] font-medium transition-colors duration-300 active:scale-[0.96] ${
          open
            ? "border-accent bg-accent text-[#01141c]"
            : "border-accent/60 bg-transparent text-accent shadow-[0_0_14px_-5px_rgba(31,188,253,0.6)] hover:border-accent hover:bg-accent hover:text-[#01141c]"
        }`}
      >
        <motion.span
          style={magnetic ? { x: mx, y: my } : undefined}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="inline-flex items-center gap-2"
        >
          Try it
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-300 ${
              open ? "bg-black/15" : "bg-accent/15 group-hover:bg-black/15"
            }`}
          >
            <QrCode size={13} weight="bold" />
          </span>
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.9, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top right" }}
            className="liquid-glass absolute right-0 top-[calc(100%+10px)] z-20 flex w-[188px] flex-col items-center rounded-[var(--radius-panel-inner)] p-4"
          >
            <p className="self-start text-[12px] font-semibold text-fg">Try {shortName}</p>

            {hasBoth && (
              <div className="mt-3 flex items-center gap-2 self-start">
                {(["playStore", "appStore"] as const).map((p) => {
                  const slug = p === "playStore" ? "googleplay" : "appstore";
                  const active = platform === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      aria-pressed={active}
                      aria-label={p === "playStore" ? "Google Play" : "App Store"}
                      className="flex h-6 w-6 items-center justify-center rounded-full transition-colors"
                      style={{ background: active ? TECH_BRAND_COLORS[slug] : "var(--bg-raised-2)" }}
                    >
                      <TechIcon slug={slug} size={12} className={active ? "text-white" : "text-fg-faint"} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Scanner-viewfinder frame — corner brackets around the QR make
                the "point your camera here" affordance visual instead of
                just implied by a plain square image. */}
            <div className="relative mt-4 p-2">
              <span className="absolute left-0 top-0 h-3.5 w-3.5 rounded-tl-[5px] border-l-2 border-t-2 border-accent" />
              <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-tr-[5px] border-r-2 border-t-2 border-accent" />
              <span className="absolute bottom-0 left-0 h-3.5 w-3.5 rounded-bl-[5px] border-b-2 border-l-2 border-accent" />
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-br-[5px] border-b-2 border-r-2 border-accent" />
              <QRSvg value={url} />
            </div>

            <p className="mt-3 text-center text-[11px] text-fg-faint">Scan with your phone&apos;s camera</p>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border-strong bg-bg px-3 py-1.5 text-[11px] font-medium text-fg-muted transition-colors hover:border-accent hover:text-accent"
            >
              Open directly
              <ArrowSquareOut size={12} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

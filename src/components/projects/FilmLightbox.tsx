"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { X } from "@phosphor-icons/react";
import { Pixels } from "../ui/Pixels";
import { FilmScreen, type FilmData } from "./FilmScreen";

const SPRING = { type: "spring", stiffness: 150, damping: 19, mass: 0.9 } as const;
const TILT = { stiffness: 140, damping: 16, mass: 0.6 };

function fit() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.max(280, Math.min(vw - 56, (vh - 170) * (16 / 9), 1240));
  return { w, h: (w * 9) / 16 };
}

/**
 * The pop-out: the film leaves its card and grows to the middle of the
 * screen from exactly where it sat (a FLIP move, so it reads as the same
 * object, not a new one), swinging in with a 3D turn on the way. Once it has
 * landed it follows the pointer with a slight tilt and a soft light, inside a
 * yellow-to-blue bezel with the site's inspector handles and a few loose grid
 * tiles at two corners, over a dark dotted backdrop. Escape, the close chip
 * or a click outside brings it back to its card, and the card's film picks up
 * from the same second. Reduced motion gets a plain fade.
 *
 * It is a second video element playing the same file (the browser cannot
 * move one playing video between two places), started at the card's time.
 */
export function FilmLightbox({
  film,
  label,
  origin,
  startAt,
  startMuted,
  onClose,
}: {
  film: FilmData;
  label: string;
  /** The card's screen rectangle when it was opened, in viewport pixels. */
  origin: { left: number; top: number; width: number };
  startAt: number;
  startMuted: boolean;
  /** Called with the playhead (seconds) when the pop-out should close. */
  onClose: (time: number) => void;
}) {
  const reduce = useReducedMotion();
  const timeRef = useRef(startAt);
  // The latest onClose, read by the key handler, so the effect below binds
  // once. (A fresh onClose on every parent render would rerun it, and its
  // cleanup would put focus back on the wrong element.)
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  const closeRef = useRef<HTMLButtonElement>(null);
  const [size, setSize] = useState(fit);

  // Where the card's screen was, relative to where the pop-out will sit.
  const [flip] = useState(() => {
    const target = fit();
    const cx = (window.innerWidth - target.w) / 2 + target.w / 2;
    const cy = window.innerHeight / 2;
    return {
      x: origin.left + origin.width / 2 - cx,
      y: origin.top + (origin.width * 9) / 32 - cy,
      scale: origin.width / target.w,
    };
  });

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current(timeRef.current);
    };
    const onResize = () => setSize(fit());
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, []);

  // Pointer tilt and light, driven by motion values so moving the pointer
  // never re-renders React.
  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const tiltX = useSpring(useMotionValue(0), TILT);
  const tiltY = useSpring(useMotionValue(0), TILT);
  const light = useMotionTemplate`radial-gradient(520px circle at ${px}% ${py}%, rgba(255,255,255,0.2), transparent 62%)`;

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    // Hold still while the pointer is on a control, so a button never slides
    // out from under it between pressing and releasing.
    if ((e.target as HTMLElement).closest("button, input")) return;
    const r = e.currentTarget.getBoundingClientRect();
    const rx = (e.clientX - r.left) / r.width;
    const ry = (e.clientY - r.top) / r.height;
    px.set(rx * 100);
    py.set(ry * 100);
    tiltX.set((0.5 - ry) * 5);
    tiltY.set((rx - 0.5) * 6);
  }

  function onLeave() {
    tiltX.set(0);
    tiltY.set(0);
  }

  const enter = reduce ? { opacity: 0 } : { x: flip.x, y: flip.y, scale: flip.scale, rotateX: 26, rotateY: -16, opacity: 0.2 };
  const settled = { x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0, opacity: 1 };
  const leave = reduce
    ? { opacity: 0 }
    : { x: flip.x, y: flip.y, scale: flip.scale, rotateX: 0, rotateY: 0, opacity: 0 };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      data-lenis-prevent
      className="ink-panel fixed inset-0 z-[120] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={() => onClose(timeRef.current)}
      // Pointer moves in here are React children of the card, which tilts on
      // pointer moves; keep them from reaching it.
      onPointerMove={(e) => e.stopPropagation()}
    >
      <div style={{ perspective: 1500 }} onClick={(e) => e.stopPropagation()}>
        <motion.div
          initial={enter}
          animate={settled}
          exit={{ ...leave, transition: { duration: 0.42, ease: [0.4, 0, 0.2, 1], opacity: { duration: 0.2, delay: 0.24 } } }}
          transition={reduce ? { duration: 0.25 } : SPRING}
        >
          <motion.div
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
            className="relative"
          >
            {/* key hints and the closing chip */}
            <div className="absolute -top-12 right-0 z-10 flex items-center gap-4">
              <p className="hidden items-center gap-3.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-white/80 md:flex">
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded-[5px] border border-white/35 px-1.5 py-0.5 font-mono text-[10.5px]">M</kbd>
                  Mute / unmute
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded-[5px] border border-white/35 px-1.5 py-0.5 font-mono text-[10.5px]">←</kbd>
                  <kbd className="rounded-[5px] border border-white/35 px-1.5 py-0.5 font-mono text-[10.5px]">→</kbd>
                  Seek
                </span>
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => onClose(timeRef.current)}
                aria-label="Close the film"
                className="flex h-9 items-center gap-2 rounded-full bg-accent-gold pl-3 pr-1.5 text-[13px] font-bold text-ink"
              >
                <span className="hidden font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] sm:inline">Esc</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white">
                  <X size={13} weight="bold" />
                </span>
              </button>
            </div>

            {/* inspector handles and tag, as on the cards */}
            <div aria-hidden className="pointer-events-none absolute -inset-3 rounded-[2.1rem] border-[1.5px] border-dashed" style={{ borderColor: "var(--accent-deep)" }}>
              {["-left-[5px] -top-[5px]", "-right-[5px] -top-[5px]", "-left-[5px] -bottom-[5px]", "-right-[5px] -bottom-[5px]"].map((pos) => (
                <span key={pos} className={`absolute h-2.5 w-2.5 border-[1.5px] bg-white ${pos}`} style={{ borderColor: "var(--accent-deep)" }} />
              ))}
              <span className="absolute left-8 top-0 hidden -translate-y-1/2 whitespace-nowrap rounded-[5px] bg-accent px-2 py-1 font-mono text-[11px] font-semibold leading-none text-white sm:block">
                Screening · {Math.round(size.w)} × {Math.round(size.h)}
              </span>
            </div>

            <Pixels pattern="corner" cell={16} delay={0.45} className="-left-20 -top-20 hidden md:grid" />
            <Pixels pattern="corner" cell={16} delay={0.6} className="-bottom-20 -right-20 hidden rotate-180 md:grid" />

            <div className="film-bezel rounded-[1.9rem] p-1.5" style={{ width: size.w + 12 }}>
              <div className="relative">
                <FilmScreen
                  expanded
                  film={film}
                  label={label}
                  startAt={startAt}
                  startMuted={startMuted}
                  onTime={(t) => {
                    timeRef.current = t;
                  }}
                  onCollapse={onClose}
                />
                {!reduce && (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[1.4rem] mix-blend-soft-light"
                    style={{ background: light }}
                  />
                )}
              </div>
            </div>

            <p className="mt-5 text-center font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-white/70">
              <span className="sm:hidden">Tap outside to close</span>
              <span className="hidden sm:inline">{label} · click outside to close</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

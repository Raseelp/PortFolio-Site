"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { TryItQR } from "./TryItQR";
import type { AchievementGroup } from "./types";

// Must match Timeline.tsx's own continuous line (`left-[5px]`) — this is
// the actual trunk, drawn once by the outer Timeline and running straight
// through every entry. This component never redraws it; it only taps off
// of it, so the fork always lands exactly on the real line.
const TRUNK_X = 5;
// The app's own node sits here, and achievement markers sit further out
// still — enough horizontal room between each marker and its text that
// nothing reads as cramped against a tiny dot.
const SUB_X = 34;
const LEAF_X = 60;

interface BranchGeometry {
  headerY: number | null;
  leafYs: number[];
}

const popVariants = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
};

const drawVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

/**
 * Achievements as an actual branching tree off the main timeline: each app
 * forks from the trunk (a tap point + curve, the trunk itself splitting),
 * gets its own short branch, and each achievement forks again off that. A
 * job with no sub-apps skips straight to achievements forking directly off
 * the trunk. Kept to the site's plain accent/muted-line palette (the trunk
 * is the only accent-colored thing; everything downstream fades to neutral)
 * rather than a different color per branch, so it reads as one structure,
 * not a decoration. The whole tree draws itself in on scroll, trunk to
 * twig. Geometry is measured from the real rendered DOM (fonts, wrapping,
 * viewport width all vary row heights), not guessed — recomputed on resize
 * and once webfonts settle.
 */
export function BranchTimeline({ groups }: { groups: AchievementGroup[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const leafRefs = useRef<Array<Array<HTMLDivElement | null>>>([]);
  const nodeRefs = useRef<Array<SVGGElement | null>>([]);
  // Keyed by a stable per-node id (not a plain pushed array, which would
  // need clearing on every render — a ref write React's lint rules
  // correctly flag as unsafe during render) so each ref callback just
  // overwrites its own slot.
  const dotRefs = useRef<Map<string, SVGCircleElement>>(new Map());
  const [branches, setBranches] = useState<BranchGeometry[] | null>(null);
  const reduce = useReducedMotion();

  // Magnetic nodes: every fork point in the tree — the trunk taps, the app
  // diamonds, the achievement leaf dots — leans toward the cursor within a
  // small radius, the same magnetism as the "Email me" CTA. Diamonds get a
  // wrapping <g> (a plain CSS transform on the rect itself would replace,
  // not combine with, its existing 45deg rotate transform); circles take
  // the transform directly.
  useEffect(() => {
    if (reduce) return;
    const targets = [...nodeRefs.current, ...dotRefs.current.values()];
    function onMove(e: PointerEvent) {
      targets.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const radius = 70;
        if (dist < radius && dist > 0.01) {
          const pull = (1 - dist / radius) * 10;
          el.style.transform = `translate(${(dx / dist) * pull}px, ${(dy / dist) * pull}px)`;
        } else {
          el.style.transform = "";
        }
      });
    }
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      targets.forEach((el) => {
        if (el) el.style.transform = "";
      });
    };
  }, [reduce, branches]);

  useLayoutEffect(() => {
    let cancelled = false;

    function measure() {
      const container = containerRef.current;
      if (!container || cancelled) return;
      const containerTop = container.getBoundingClientRect().top;

      const next = groups.map((_, i) => {
        const headerEl = headerRefs.current[i];
        const headerY = headerEl
          ? headerEl.getBoundingClientRect().top - containerTop + headerEl.offsetHeight / 2
          : null;
        const leafYs = (leafRefs.current[i] ?? []).map((el) =>
          el ? el.getBoundingClientRect().top - containerTop + 8 : 0
        );
        return { headerY, leafYs };
      });
      setBranches(next);
    }

    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      cancelled = true;
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups.map((g) => g.achievements.length).join(",")]);

  return (
    <div ref={containerRef} className="relative">
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="branch-fade" x1={TRUNK_X} y1="0" x2={SUB_X} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--border-strong)" />
          </linearGradient>
        </defs>

        {branches?.map((branch, i) => (
          <motion.g
            key={i}
            initial={reduce ? "show" : "hidden"}
            whileInView={reduce ? undefined : "show"}
            viewport={{ once: true, amount: 0.4 }}
            variants={staggerParent}
          >
            {branch.headerY != null ? (
              <>
                <motion.circle
                  ref={(el) => {
                    if (el) dotRefs.current.set(`trunk-${i}`, el);
                    else dotRefs.current.delete(`trunk-${i}`);
                  }}
                  variants={popVariants}
                  cx={TRUNK_X}
                  cy={branch.headerY}
                  r={3}
                  className="fill-accent"
                />

                <motion.path
                  variants={drawVariants}
                  d={`M ${TRUNK_X} ${branch.headerY} C ${TRUNK_X + 14} ${branch.headerY}, ${SUB_X - 10} ${branch.headerY}, ${SUB_X} ${branch.headerY}`}
                  fill="none"
                  stroke="url(#branch-fade)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />

                <g
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  style={{ transformOrigin: `${SUB_X}px ${branch.headerY}px` }}
                >
                  <motion.rect
                    variants={popVariants}
                    x={SUB_X - 3}
                    y={branch.headerY - 3}
                    width={6}
                    height={6}
                    className="fill-fg"
                    transform={`rotate(45 ${SUB_X} ${branch.headerY})`}
                  />
                </g>

                {branch.leafYs.length > 0 && (
                  <motion.line
                    variants={drawVariants}
                    x1={SUB_X}
                    y1={branch.headerY}
                    x2={SUB_X}
                    y2={branch.leafYs[branch.leafYs.length - 1]}
                    stroke="var(--border-strong)"
                    strokeWidth={1.5}
                  />
                )}

                {branch.leafYs.map((leafY, j) => (
                  <motion.g key={j} variants={staggerParent}>
                    <motion.line
                      variants={drawVariants}
                      x1={SUB_X}
                      y1={leafY}
                      x2={LEAF_X}
                      y2={leafY}
                      stroke="var(--border-strong)"
                      strokeWidth={1.5}
                    />
                    <motion.circle
                      ref={(el) => {
                        const key = `leaf-${i}-${j}`;
                        if (el) dotRefs.current.set(key, el);
                        else dotRefs.current.delete(key);
                      }}
                      variants={popVariants}
                      cx={LEAF_X}
                      cy={leafY}
                      r={2.5}
                      className="fill-fg-faint"
                    />
                  </motion.g>
                ))}
              </>
            ) : (
              branch.leafYs.map((leafY, j) => (
                <motion.g key={j} variants={staggerParent}>
                  <motion.circle
                    ref={(el) => {
                      const key = `direct-trunk-${i}-${j}`;
                      if (el) dotRefs.current.set(key, el);
                      else dotRefs.current.delete(key);
                    }}
                    variants={popVariants}
                    cx={TRUNK_X}
                    cy={leafY}
                    r={3}
                    className="fill-accent"
                  />
                  <motion.path
                    variants={drawVariants}
                    d={`M ${TRUNK_X} ${leafY} C ${TRUNK_X + 14} ${leafY}, ${LEAF_X - 10} ${leafY}, ${LEAF_X} ${leafY}`}
                    fill="none"
                    stroke="url(#branch-fade)"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                  <motion.circle
                    ref={(el) => {
                      const key = `direct-leaf-${i}-${j}`;
                      if (el) dotRefs.current.set(key, el);
                      else dotRefs.current.delete(key);
                    }}
                    variants={popVariants}
                    cx={LEAF_X}
                    cy={leafY}
                    r={2.5}
                    className="fill-fg-faint"
                  />
                </motion.g>
              ))
            )}
          </motion.g>
        ))}
      </svg>

      <div className="flex flex-col gap-8">
        {groups.map((group, i) => (
          <div key={group.name ?? "root"} className="flex flex-col gap-5">
            {group.name && (
              <div
                ref={(el) => {
                  headerRefs.current[i] = el;
                }}
                className="flex flex-wrap items-center justify-between gap-3 pl-14"
              >
                <p className="text-[14px] font-medium text-fg">{group.name}</p>
                {group.links && (
                  <TryItQR appName={group.name} playStore={group.links.playStore} appStore={group.links.appStore} />
                )}
              </div>
            )}
            <div className="flex flex-col gap-5">
              {group.achievements.map((a, j) => (
                <div
                  key={a.label}
                  ref={(el) => {
                    leafRefs.current[i] = leafRefs.current[i] ?? [];
                    leafRefs.current[i][j] = el;
                  }}
                  className="pl-20"
                >
                  <p className="text-[13px] font-semibold text-fg">{a.label}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{a.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

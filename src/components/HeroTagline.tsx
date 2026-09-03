"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import { getRipple, getSnakeSegments } from "@/lib/heroDisturbance";

type GameMoment = "start" | "gameover" | null;

interface HeroTaglineProps {
  tagline: string;
  /** Which entry of heroQuotes `tagline` currently is — used as the
   * AnimatePresence key so a quote rotating to a *different* quote
   * crossfades the same way switching in/out of a game moment does,
   * rather than swapping instantly. */
  quoteIndex: number;
  moment: GameMoment;
  reduceMotion: boolean;
  /** The hero panel the canvas beneath also fills exactly — see
   * heroDisturbance.ts for why that makes canvas-local pixels and this
   * container's own coordinate space the same thing. */
  containerRef: RefObject<HTMLDivElement | null>;
}

const MOMENT_COPY: Record<Exclude<GameMoment, null>, { text: string }> = {
  start: { text: "GAME ON" },
  gameover: { text: "GAME OVER" },
};

// The full accent set, not just one color per moment — a festival burst
// cycles through all of it rather than staying monochrome.
const FESTIVAL_COLORS = [
  "var(--accent)",
  "var(--accent-warm)",
  "var(--accent-gold)",
  "var(--accent-pink)",
  "var(--accent-sky)",
];
const CONFETTI_COUNT = 70;

interface Confetto {
  id: number;
  dx: number;
  dy: number;
  size: number;
  duration: number;
  color: string;
  rotate: number;
  /** Rectangles read as confetti; circles read as sparks — mixing both
   * reads as a proper celebratory burst instead of a spray of dots. */
  shape: "rect" | "circle";
}

function buildConfetti(): Confetto[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => {
    const angle = (Math.PI * 2 * i) / CONFETTI_COUNT + Math.random() * 0.5;
    const dist = 90 + Math.random() * 220;
    return {
      id: i,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist - 40, // stronger upward bias — a real firework arc
      size: 5 + Math.random() * 8,
      duration: 0.9 + Math.random() * 0.7,
      color: FESTIVAL_COLORS[i % FESTIVAL_COLORS.length],
      rotate: (Math.random() - 0.5) * 720,
      shape: i % 3 === 0 ? "circle" : "rect",
    };
  });
}

/**
 * The hero's poetic line is really a rotating set of quotes (heroQuotes in
 * content.ts) — HeroGlow owns the actual timer/random-pick logic and just
 * hands down whichever one is current plus its index; this crossfades
 * between them (the same AnimatePresence already used for the game moment
 * below, just keyed on the quote index instead) whenever that index
 * changes.
 *
 * The tagline also doubles as the one reward for playing the hidden Snake
 * game (see ui/hero-bg): starting a run via the Snake toggle, or crashing
 * out of one, blows whichever quote is showing away for a beat with a big,
 * festival-colored "GAME ON"/"GAME OVER" callout — a rainbow-shimmer text
 * fill cycling the site's whole accent palette, plus a confetti burst —
 * before it settles back to the normal tagline. Nothing is ever labeled;
 * this payoff is the reward for finding and playing the game.
 */
export function HeroTagline({ tagline, quoteIndex, moment, reduceMotion, containerRef }: HeroTaglineProps) {
  const confetti = useMemo(() => (moment && !reduceMotion ? buildConfetti() : []), [moment, reduceMotion]);

  return (
    <div className="relative flex w-full max-w-2xl items-center justify-center">
      <AnimatePresence mode="wait">
        {moment ? (
          <motion.p
            key={moment}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.3, y: 10 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: [0.3, 1.35, 1], y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
            transition={reduceMotion ? { duration: 0.2 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`font-mono text-5xl font-black uppercase tracking-[0.16em] sm:text-6xl md:text-7xl ${
              reduceMotion ? "" : "festival-text festival-text-animated"
            }`}
            style={
              reduceMotion
                ? { color: "var(--accent)" }
                : {
                    backgroundImage: `linear-gradient(90deg, ${FESTIVAL_COLORS.join(", ")}, ${FESTIVAL_COLORS[0]})`,
                  }
            }
          >
            {MOMENT_COPY[moment].text}
          </motion.p>
        ) : (
          <motion.div
            key={`tagline-${quoteIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.9, ease: "easeInOut" }}
          >
            <CollidableTagline tagline={tagline} reduceMotion={reduceMotion} containerRef={containerRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {confetti.length > 0 && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
          {confetti.map((c) => (
            <motion.span
              key={c.id}
              className={`absolute left-1/2 top-1/2 block ${c.shape === "circle" ? "rounded-full" : "rounded-[2px]"}`}
              style={{
                width: c.shape === "rect" ? c.size * 1.8 : c.size,
                height: c.shape === "rect" ? c.size * 0.7 : c.size,
                marginLeft: -c.size / 2,
                marginTop: -c.size / 2,
                backgroundColor: c.color,
                boxShadow: `0 0 10px ${c.color}`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
              animate={{ x: c.dx, y: c.dy, opacity: 0, scale: 0.3, rotate: c.rotate }}
              transition={{ duration: c.duration, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// The exact same numbers BgWidgetGrid's background icon-push physics uses
// (SPRING_K/SPRING_DAMPING/ICON_PUSH_ACCEL there) — that's the smooth,
// glide-out-and-drift-back feel this is meant to match, so it borrows the
// recipe outright rather than approximating it. No offset clamp, same as
// the icons: a hard positional clamp with no matching velocity clamp is
// exactly what made the old version feel like it hit a wall mid-motion
// instead of gliding.
const SPRING_K = 4;
const SPRING_DAMPING = 2 * Math.sqrt(SPRING_K);
const RIPPLE_PUSH_ACCEL = 9000;
const SNAKE_RADIUS = 34;
const SNAKE_PUSH_ACCEL = 9000;
// The ripple only ever touches a letter for the brief moment its traveling
// band sweeps across it (~ringWidth / RING_SPEED, under 100ms) before
// moving on — that bounded window is what reads as one clean flick. A
// snake segment has no such built-in edge: it can sit within SNAKE_RADIUS
// of a letter for many consecutive ticks, continuously re-accelerating it
// the whole time, which is what read as rough instead of smooth. Capping
// how long a single approach is allowed to keep pushing — then requiring
// the segment to fully leave and come back before it can push again —
// gives the snake the same one-clean-flick shape as the ripple.
const SNAKE_EXPOSURE_CAP = 0.12;

interface LetterPhysics {
  restX: number;
  restY: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  /** Seconds this letter has been continuously within SNAKE_RADIUS of some
   * segment during the current approach; resets once it clears the radius. */
  snakeExposure: number;
}

/**
 * The normal poetic tagline, split into one <span> per letter (words kept
 * as non-breaking units so line-wrapping still only happens between
 * words) so the click ripple and the Snake game's own body can act on it
 * like a real obstacle: each letter gets pushed out of the way as the
 * ripple's wavefront or a snake segment passes under it, then eases back
 * to its resting position via the same damped-spring recipe the hero's
 * icon-push physics already uses — a nudge, never a fling, and always
 * fully recovered once whatever disturbed it has moved on.
 */
function CollidableTagline({
  tagline,
  reduceMotion,
  containerRef,
}: {
  tagline: string;
  reduceMotion: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const words = useMemo(() => tagline.split(" "), [tagline]);
  // Self-maintaining via each letter's own ref callback below — React calls
  // a ref callback with `null` as an element unmounts, so this never needs
  // a manual reset. (It used to have one; that ran in an effect, which
  // fires *after* the ref callbacks that just populated this array during
  // commit, silently wiping it back to empty before the physics effect
  // below ever got to read it.)
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (reduceMotion) return;
    const container = containerRef.current;
    if (!container) return;
    const letters = lettersRef.current;

    let physics: LetterPhysics[] = [];

    function measure() {
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      physics = letters.map((el) => {
        if (!el) return { restX: 0, restY: 0, ox: 0, oy: 0, vx: 0, vy: 0, snakeExposure: 0 };
        const r = el.getBoundingClientRect();
        return {
          restX: r.left + r.width / 2 - containerRect.left,
          restY: r.top + r.height / 2 - containerRect.top,
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
          snakeExposure: 0,
        };
      });
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);

    let raf = 0;
    let lastTime = 0;
    function frame(t: number) {
      raf = requestAnimationFrame(frame);
      const time = t * 0.001;
      const dt = Math.min(0.05, time - lastTime || 0);
      lastTime = time;

      const ripple = getRipple();
      const segments = getSnakeSegments();

      for (let i = 0; i < physics.length; i++) {
        const p = physics[i];
        const el = letters[i];
        if (!el) continue;

        if (ripple) {
          const dx = p.restX - ripple.cx;
          const dy = p.restY - ripple.cy;
          const dist = Math.hypot(dx, dy) || 1;
          const ringDist = Math.abs(dist - ripple.waveFront);
          const falloff = Math.max(0, 1 - ringDist / ripple.ringWidth) * ripple.strength;
          if (falloff > 0.01 && dist > 2) {
            p.vx += (dx / dist) * RIPPLE_PUSH_ACCEL * falloff * dt;
            p.vy += (dy / dist) * RIPPLE_PUSH_ACCEL * falloff * dt;
          }
        }

        // Closest segment only — the letter should feel one body passing
        // by, not get summed forces from several segments trailing behind
        // each other at once.
        let closestDist = Infinity;
        let closestDx = 0;
        let closestDy = 0;
        for (const seg of segments) {
          const dx = p.restX - seg.x;
          const dy = p.restY - seg.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < SNAKE_RADIUS && dist < closestDist) {
            closestDist = dist;
            closestDx = dx;
            closestDy = dy;
          }
        }
        if (closestDist < SNAKE_RADIUS) {
          if (p.snakeExposure < SNAKE_EXPOSURE_CAP) {
            const falloff = 1 - closestDist / SNAKE_RADIUS;
            p.vx += (closestDx / closestDist) * SNAKE_PUSH_ACCEL * falloff * dt;
            p.vy += (closestDy / closestDist) * SNAKE_PUSH_ACCEL * falloff * dt;
            p.snakeExposure += dt;
          }
        } else {
          p.snakeExposure = 0;
        }

        // Damped-spring return to rest — the same critically-damped recipe
        // as the background icon-push, so a strongly-pushed letter coasts
        // out and glides back rather than snapping. No clamp here, same as
        // the icons — always let the spring itself decide the travel.
        p.vx += (-p.ox * SPRING_K - p.vx * SPRING_DAMPING) * dt;
        p.vy += (-p.oy * SPRING_K - p.vy * SPRING_DAMPING) * dt;
        p.ox += p.vx * dt;
        p.oy += p.vy * dt;

        // Always write the transform, including the (0.00, 0.00) resting
        // case, rather than swapping to an empty string — removing and
        // re-adding the property is what read as a small snap right at the
        // end of the glide instead of a continuous approach to zero.
        el.style.transform = `translate(${p.ox.toFixed(2)}px, ${p.oy.toFixed(2)}px)`;
      }
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      for (const el of letters) {
        if (el) el.style.transform = "";
      }
    };
  }, [reduceMotion, containerRef, tagline]);

  let flatIndex = 0;

  return (
    <p className="text-balance text-2xl font-bold leading-snug text-white sm:text-3xl md:text-4xl">
      {words.map((word, wi) => (
        <span key={wi}>
          <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {word.split("").map((ch, li) => {
              const idx = flatIndex++;
              return (
                <span
                  key={li}
                  ref={(el) => {
                    lettersRef.current[idx] = el;
                  }}
                  style={reduceMotion ? { display: "inline-block" } : { display: "inline-block", willChange: "transform" }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

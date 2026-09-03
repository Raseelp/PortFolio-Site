"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import { TECH_ICON_PATHS, TECH_BRAND_COLORS, type TechIconSlug } from "@/lib/techIcons";
import { SnakeGame, GAME_OVER_HOLD_MS, type Direction } from "./snakeGame";
import { playEat, playGameOver, playGameStart, playSplash } from "@/lib/sound";
import { setMusicMode } from "@/lib/music";
import {
  onSnakeDirectionRequested,
  onSnakeStartRequested,
  onSnakeStopRequested,
  requestSnakeStop,
} from "@/lib/snakeControl";
import { reportRipple, reportSnakeSegments } from "@/lib/heroDisturbance";

const CELL = 46;
const GAP = 6;
const ICON_SLUGS = ["dart", "flutter", "kotlin", "android", "getx", "git", "firebase", "figma"] as const;
// The sound/snake toggle buttons occupy roughly this many pixels near the
// top of the screen on every viewport size — see snakeGame.ts's
// `topSafeRows`.
const TOP_SAFE_PX = 80;

// Ripple/shockwave tuning. The ring expands at RING_SPEED px/s; an icon
// only feels a push (and only "poisons" with the clicked icon's brand
// color) for the brief window the ring is actually passing over it —
// not everything within some fixed click radius all at once. The push is
// strong enough to genuinely carry an icon across several grid squares;
// a soft, near-critically-damped spring (real damped-harmonic-oscillator
// math, not a flat per-frame multiplier) then glides it back home without
// bouncing past its slot.
const RING_SPEED = 900;
const RING_WIDTH = 80;
const ICON_HIT_RADIUS = 20;
const ICON_PUSH_ACCEL = 9000;
const SPRING_K = 4;
const SPRING_DAMPING = 2 * Math.sqrt(SPRING_K); // critical damping for SPRING_K
const REPEL_DIST = 26;
const SWIPE_THRESHOLD = 24;

// Deterministic pseudo-random hash — same cell always gets the same
// selection/phase, so the pattern doesn't reshuffle every frame.
function hash(x: number, y: number): number {
  const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

interface IconPhysics {
  ox: number;
  oy: number;
  vx: number;
  vy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  /** Overrides the default accent color — used for Snake's eat bursts. */
  color?: string;
  /** Scales particle size — Snake's eat bursts read bigger/juicier than the
   * default click sparks. */
  sizeMul?: number;
}

/** A single expanding-and-fading ring, stamped at the moment Snake eats —
 * a distinct "pop" shockwave on top of the spark burst, the same
 * expanding-ring language the click-ripple already uses elsewhere on this
 * canvas, just short-lived and centered on one cell instead of sweeping the
 * whole grid. */
interface EatPop {
  x: number;
  y: number;
  color: string;
  /** A second, differently-colored ring that trails slightly behind the
   * first — see the draw loop's festival-pop rendering. */
  secondColor: string;
  age: number;
}

interface BgWidgetGridProps {
  mouseX?: MotionValue<number>;
  mouseY?: MotionValue<number>;
  mouseActive?: MotionValue<number>;
  clickX?: MotionValue<number>;
  clickY?: MotionValue<number>;
  clickStrength?: MotionValue<number>;
  /** Fired on Snake's "start" and "gameover" transitions — HeroGlow uses
   * this to hijack the tagline for a beat. Not a score feed. */
  onGameEvent?: (event: "start" | "gameover") => void;
}

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  W: "up",
  S: "down",
  A: "left",
  D: "right",
};

/**
 * The hero background: a grid of widget-like tiles, each occasionally
 * showing a real tech-brand icon, with a slow ambient wave and
 * cursor-proximity glow/lift. A click sends an expanding ring (plus a
 * spark burst) — if the click lands directly on an icon, that icon
 * "poisons" the ring with its own real brand color as it travels outward
 * (tinting whatever widgets the ring passes over), and reverts once the
 * ripple finishes. The same expanding ring physically pushes nearby icons
 * outward at the moment it reaches them — not all at once at click time —
 * with a spring pulling each back to its grid slot afterward, and a light
 * pairwise repulsion so two icons flung toward each other don't overlap.
 *
 * Hidden inside the same grid: Snake, played on these exact cells (see
 * ./snakeGame). It idles in a slow cosmetic "attract mode" until a real
 * arrow/WASD press or a swipe arms it into a real, steered run — which
 * fires `onGameEvent("start")` up to HeroGlow so the hero tagline can react.
 */
export function BgWidgetGrid({
  mouseX,
  mouseY,
  mouseActive,
  clickX,
  clickY,
  clickStrength,
  onGameEvent,
}: BgWidgetGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clickTimeRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const eatPopsRef = useRef<EatPop[]>([]);
  const iconPhysicsRef = useRef<Map<string, IconPhysics>>(new Map());
  const rippleColorRef = useRef<string | null>(null);
  const gameRef = useRef<SnakeGame | null>(null);
  // Ref-synced (not a direct dependency of the effect below) so a new
  // `onGameEvent` identity from HeroGlow never tears down and rebuilds the
  // whole canvas/game loop — see the same pattern this file used to use for
  // the old score callback.
  const onGameEventRef = useRef(onGameEvent);
  useEffect(() => {
    onGameEventRef.current = onGameEvent;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue("--accent").trim() || "#1fbcfd";
    const accentRgb = hexToRgb(accent);
    // A brighter mixed palette for Snake's "festival" eat burst — resolved
    // once here since a canvas fillStyle can't read a CSS var() directly.
    const festivalColors = [
      accent,
      style.getPropertyValue("--accent-warm").trim() || "#9880ff",
      style.getPropertyValue("--accent-gold").trim() || "#ffb238",
      style.getPropertyValue("--accent-pink").trim() || "#ff6ba8",
      style.getPropertyValue("--accent-sky").trim() || "#6c8cff",
    ];
    // Snake's food order (see snakeGame.ts) draws from this same icon set,
    // so no extra paths need loading for it.
    const iconPaths: Record<string, Path2D> = {};
    for (const slug of ICON_SLUGS) iconPaths[slug] = new Path2D(TECH_ICON_PATHS[slug][0]);

    const game = new SnakeGame();
    let active = false;
    game.onEvent = (event) => {
      if (event === "start") {
        playGameStart();
        setMusicMode("energetic");
      } else {
        playGameOver();
        setMusicMode("calm");
        // A collision ends the run on its own — the toggle button (and the
        // snake itself) should reflect that once the "GAME OVER" beat is
        // done, the same way pressing "stop" would, rather than leaving the
        // button showing "playing" for a game that's no longer running.
        window.setTimeout(() => requestSnakeStop(), GAME_OVER_HOLD_MS);
      }
      onGameEventRef.current?.(event);
    };
    gameRef.current = game;

    const unsubStart = onSnakeStartRequested(() => {
      active = true;
      game.forceStart();
    });
    const unsubStop = onSnakeStopRequested(() => {
      active = false;
      game.forceStop();
      // A manual stop is the same "stop being energetic" moment a
      // collision is — game.forceStop() deliberately fires no event (it's
      // not a loss), so this is the one place responsible for reverting
      // the music back to calm again.
      setMusicMode("calm");
    });
    // The mobile D-pad steers through the exact same setDirection() path
    // keyboard/swipe already use — same "only while a run is active" gate.
    const unsubDirection = onSnakeDirectionRequested((dir) => {
      if (!active) return;
      gameRef.current?.setDirection(dir);
    });

    // CSS-pixel size of the canvas — every existing CELL/GAP pixel
    // calculation below stays in these units regardless of device pixel
    // ratio; only the backing store and one ctx.setTransform below need to
    // know about `dpr`.
    let cssW = 0;
    let cssH = 0;

    function resize() {
      if (!canvas || !ctx) return;
      const parent = canvas.parentElement;
      cssW = parent?.clientWidth ?? window.innerWidth;
      cssH = parent?.clientHeight ?? window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      iconPhysicsRef.current.clear();
      // The sound/snake toggle buttons sit fixed near the top of the
      // screen; keep food from spawning where they'd hide it.
      game.topSafeRows = Math.ceil(TOP_SAFE_PX / (CELL + GAP));
    }
    resize();
    // ResizeObserver catches everything a plain window "resize" listener
    // can miss on mobile — the address bar showing/hiding, orientation
    // changes, the dynamic-viewport-height the hero itself uses — any of
    // which changes this element's actual box without necessarily firing a
    // window-level resize event. (This was the real cause of the reported
    // "snake goes out of bounds on mobile" bug: the canvas's backing store
    // stayed sized for a stale viewport while its CSS box had already
    // changed, so the coordinate math and the visible area disagreed.)
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener("resize", resize);

    // Keyboard control — only steers while the game is actually running
    // (the Snake toggle button is what starts it now, not a keypress) and
    // the cursor is over the hero (or it has keyboard focus, which also
    // drives `mouseActive` — see HeroGlow), so arrow keys never hijack page
    // scroll for someone just scrolling past.
    function handleKeyDown(e: KeyboardEvent) {
      if (!active) return;
      const dir = KEY_TO_DIRECTION[e.key];
      if (!dir) return;
      if ((mouseActive?.get() ?? 0) < 0.5) return;
      e.preventDefault();
      gameRef.current?.setDirection(dir);
    }
    window.addEventListener("keydown", handleKeyDown);

    // Swipe control for touch — a quick tap still falls through to the
    // existing click-ripple (bound on the parent), a real drag steers, but
    // only once the toggle button has actually started a run.
    let touchStart: { x: number; y: number } | null = null;
    function handlePointerDown(e: PointerEvent) {
      touchStart = { x: e.clientX, y: e.clientY };
    }
    function handlePointerUp(e: PointerEvent) {
      if (!touchStart || !active) return;
      const dx = e.clientX - touchStart.x;
      const dy = e.clientY - touchStart.y;
      touchStart = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;
      const dir: Direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
      gameRef.current?.setDirection(dir);
    }
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);

    let raf = 0;
    let lastClickStrength = 0;
    let lastFrameTime = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (!ctx || !canvas) return;
      const w = cssW;
      const h = cssH;
      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / (CELL + GAP)) + 1;
      const rows = Math.ceil(h / (CELL + GAP)) + 1;
      const time = t * 0.001;
      const dt = Math.min(0.05, time - lastFrameTime || 0);
      lastFrameTime = time;

      const strength = mouseActive?.get() ?? 0;
      const mx = mouseX ? (mouseX.get() / 100) * w : -9999;
      const my = mouseY ? (mouseY.get() / 100) * h : -9999;

      // Keep the grid dimensions in sync even while inactive, so food/body
      // positions are already correct the instant the toggle starts a run
      // instead of snapping into place on the first frame after.
      game.resize(cols, rows);
      if (active) {
        game.setCursor(
          strength > 0.1 ? Math.floor(mx / (CELL + GAP)) : null,
          strength > 0.1 ? Math.floor(my / (CELL + GAP)) : null
        );
        game.tick(dt * 1000);
        // Segment centers in the same canvas-local pixel space the hero
        // tagline's letters get measured in (see heroDisturbance.ts) — lets
        // the snake's body physically "collide" with the text sitting on
        // top of it.
        reportSnakeSegments(
          game.body.map((seg) => ({
            x: seg.col * (CELL + GAP) + CELL / 2,
            y: seg.row * (CELL + GAP) + CELL / 2,
          }))
        );
        for (const burst of game.drainBursts()) {
          const bx = burst.col * (CELL + GAP) + CELL / 2;
          const by = burst.row * (CELL + GAP) + CELL / 2;
          eatPopsRef.current.push({
            x: bx,
            y: by,
            color: burst.color,
            secondColor: festivalColors[Math.floor(Math.random() * festivalColors.length)],
            age: 0,
          });
          playEat(burst.pitchStep);
          // A festival-sized burst: more particles than the click-ripple's
          // spark, and mixed across the site's whole accent palette (not
          // just the eaten icon's own color) so it reads as a proper
          // celebratory pop rather than a color-matched blip.
          for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 7;
            particlesRef.current.push({
              x: bx,
              y: by,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1,
              color: i % 3 === 0 ? festivalColors[Math.floor(Math.random() * festivalColors.length)] : burst.color,
              sizeMul: 2.4,
            });
          }
        }
      } else {
        reportSnakeSegments([]);
      }

      const currentClick = clickStrength?.get() ?? 0;
      const justClicked = currentClick > 0.9 && lastClickStrength <= 0.9;
      const cx = clickX ? (clickX.get() / 100) * w : -9999;
      const cy = clickY ? (clickY.get() / 100) * h : -9999;
      if (currentClick > lastClickStrength) clickTimeRef.current = time;
      lastClickStrength = currentClick;
      const clickAge = time - clickTimeRef.current;
      const waveFront = clickAge * RING_SPEED;
      reportRipple(currentClick > 0.01 ? { cx, cy, waveFront, ringWidth: RING_WIDTH, strength: currentClick } : null);

      // Collect this frame's icon tiles — position is deterministic from
      // the grid; only the physics offset moves.
      const iconTiles: { key: string; cellCx: number; cellCy: number; slug: TechIconSlug; isHint: boolean }[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const sel = hash(col, row);
          if (sel >= 0.07) continue;
          const cellCx = col * (CELL + GAP) + CELL / 2;
          const cellCy = row * (CELL + GAP) + CELL / 2;
          const slug = ICON_SLUGS[Math.floor(hash(col, row + 100) * ICON_SLUGS.length)];
          const key = `${col},${row}`;
          // A rare handful of "icon" tiles quietly show a small directional
          // cluster instead of a tech mark — never labeled, never called
          // out, just something a curious eye might notice looks like
          // arrows and try pressing some.
          const isHint = hash(col, row + 300) < 0.02;
          iconTiles.push({ key, cellCx, cellCy, slug, isHint });
          if (!iconPhysicsRef.current.has(key)) iconPhysicsRef.current.set(key, { ox: 0, oy: 0, vx: 0, vy: 0 });
        }
      }

      if (justClicked) {
        playSplash();
        // Spark burst, always.
        for (let i = 0; i < 26; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.5 + Math.random() * 3.5;
          particlesRef.current.push({ x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1 });
        }

        // Hit-test: did the click land directly on an icon's current
        // (physics-offset) position? If so, that icon's own brand color
        // is what the ripple poisons outward with.
        let hit: (typeof iconTiles)[number] | null = null;
        let hitDist = ICON_HIT_RADIUS;
        for (const tile of iconTiles) {
          const phys = iconPhysicsRef.current.get(tile.key)!;
          const dist = Math.hypot(tile.cellCx + phys.ox - cx, tile.cellCy + phys.oy - cy);
          if (dist < hitDist) {
            hit = tile;
            hitDist = dist;
          }
        }
        rippleColorRef.current = hit ? (TECH_BRAND_COLORS[hit.slug] ?? null) : null;
      }

      const rippleRgb = rippleColorRef.current ? hexToRgb(rippleColorRef.current) : accentRgb;

      // Icon physics: push outward at the moment the ring passes each
      // icon (not all at once at click time), spring back to the grid
      // slot, damp, then a light pairwise repulsion to avoid overlap.
      if (currentClick > 0.01) {
        for (const tile of iconTiles) {
          const phys = iconPhysicsRef.current.get(tile.key)!;
          const dx = tile.cellCx - cx;
          const dy = tile.cellCy - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const ringDist = Math.abs(dist - waveFront);
          const ringFalloff = Math.max(0, 1 - ringDist / RING_WIDTH) * currentClick;
          if (ringFalloff > 0.01 && dist > 4) {
            phys.vx += (dx / dist) * ICON_PUSH_ACCEL * ringFalloff * dt;
            phys.vy += (dy / dist) * ICON_PUSH_ACCEL * ringFalloff * dt;
          }
        }
      }
      for (const tile of iconTiles) {
        const phys = iconPhysicsRef.current.get(tile.key)!;
        // Real damped-harmonic-oscillator step: a weak restoring force lets
        // a strongly-pushed icon coast well past its own square before the
        // (near-critical) damping term smoothly kills the velocity on the
        // way back, rather than snapping home or bouncing past it.
        phys.vx += (-phys.ox * SPRING_K - phys.vx * SPRING_DAMPING) * dt;
        phys.vy += (-phys.oy * SPRING_K - phys.vy * SPRING_DAMPING) * dt;
        phys.ox += phys.vx * dt;
        phys.oy += phys.vy * dt;
      }
      for (let i = 0; i < iconTiles.length; i++) {
        const a = iconTiles[i];
        const pa = iconPhysicsRef.current.get(a.key)!;
        for (let j = i + 1; j < iconTiles.length; j++) {
          const b = iconTiles[j];
          const pb = iconPhysicsRef.current.get(b.key)!;
          const dx = b.cellCx + pb.ox - (a.cellCx + pa.ox);
          const dy = b.cellCy + pb.oy - (a.cellCy + pa.oy);
          const dist = Math.hypot(dx, dy) || 0.001;
          if (dist < REPEL_DIST) {
            const push = ((REPEL_DIST - dist) / REPEL_DIST) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;
            pa.ox -= nx * push;
            pa.oy -= ny * push;
            pb.ox += nx * push;
            pb.oy += ny * push;
          }
        }
      }

      // Base tiles: ambient wave + cursor glow, always in the signature accent.
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * (CELL + GAP);
          const y = row * (CELL + GAP);
          const cellCx = x + CELL / 2;
          const cellCy = y + CELL / 2;

          const wave = Math.sin(col * 0.4 + row * 0.3 - time * 1.4) * 0.5 + 0.5;
          let brightness = 0.06 + wave * 0.1;
          const distToMouse = Math.hypot(cellCx - mx, cellCy - my);
          brightness += Math.max(0, 1 - distToMouse / 160) * 0.5 * strength;
          brightness = Math.min(1, brightness);

          const lift = Math.max(0, 1 - distToMouse / 160) * strength * 3;
          ctx.fillStyle = `rgba(${accentRgb}, ${brightness})`;
          ctx.fillRect(x, y - lift, CELL, CELL);

          // The ripple itself — drawn as a separate colored layer on top,
          // so only the ring's own band takes the poisoned color while the
          // rest of the grid stays in the signature accent.
          if (currentClick > 0.01) {
            const distToClick = Math.hypot(cellCx - cx, cellCy - cy);
            const ringDist = Math.abs(distToClick - waveFront);
            const rippleBrightness = Math.max(0, 1 - ringDist / 60) * 0.9 * currentClick;
            if (rippleBrightness > 0.01) {
              ctx.fillStyle = `rgba(${rippleRgb}, ${rippleBrightness})`;
              ctx.fillRect(x, y - lift, CELL, CELL);
            }
          }
        }
      }

      // Icons, in a separate pass so a flung icon can visually cross into
      // a neighboring tile instead of being clipped by it.
      for (const tile of iconTiles) {
        const phys = iconPhysicsRef.current.get(tile.key)!;
        const dist = Math.hypot(tile.cellCx - cx, tile.cellCy - cy);
        const ringDist = Math.abs(dist - waveFront);
        const poison = currentClick > 0.01 ? Math.max(0, 1 - ringDist / RING_WIDTH) * currentClick : 0;

        const iconSize = 18;
        ctx.save();
        ctx.translate(tile.cellCx + phys.ox - iconSize / 2, tile.cellCy + phys.oy - iconSize / 2);
        ctx.scale(iconSize / 24, iconSize / 24);
        if (poison > 0.03 && rippleColorRef.current) {
          ctx.shadowColor = rippleColorRef.current;
          ctx.shadowBlur = 14 * poison;
          ctx.fillStyle = rippleColorRef.current;
          ctx.globalAlpha = 0.55 + poison * 0.45;
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.55)";
        }
        if (tile.isHint) {
          drawDirectionalHint(ctx);
        } else {
          ctx.fill(iconPaths[tile.slug]);
        }
        ctx.restore();
      }

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life -= 0.02;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color ?? accent;
        if (p.color) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, (2 + p.life * 1.5) * (p.sizeMul ?? 1), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Snake's eat "pop" — a bright ring that expands and fades fast, so
      // an eat reads as an unmistakable event, not just a color change.
      // Two rings (the second delayed and in a different festival color)
      // instead of one, for a bigger, more celebratory pop.
      const pops = eatPopsRef.current;
      for (let i = pops.length - 1; i >= 0; i--) {
        const pop = pops[i];
        pop.age += dt;
        const duration = 0.7;
        if (pop.age >= duration) {
          pops.splice(i, 1);
          continue;
        }
        const progress = pop.age / duration;
        ctx.save();
        ctx.globalAlpha = 1 - progress;
        ctx.strokeStyle = pop.color;
        ctx.lineWidth = 4 * (1 - progress) + 1;
        ctx.shadowColor = pop.color;
        ctx.shadowBlur = 22;
        ctx.beginPath();
        ctx.arc(pop.x, pop.y, 8 + progress * 56, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        const delayed = progress - 0.18;
        if (delayed > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - delayed / (1 - 0.18)) * 0.8;
          ctx.strokeStyle = pop.secondColor;
          ctx.lineWidth = 3;
          ctx.shadowColor = pop.secondColor;
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(pop.x, pop.y, 8 + delayed * 56, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      if (active) game.draw(ctx, iconPaths, CELL, GAP, time);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      unsubStart();
      unsubStop();
      unsubDirection();
    };
  }, [mouseX, mouseY, mouseActive, clickX, clickY, clickStrength]);

  // No `touch-action: none` here on purpose — the hero fills the viewport,
  // so disabling default touch handling would trap a mobile visitor's
  // normal swipe-to-scroll. A vertical swipe steers the snake AND scrolls
  // the page; a deliberate tradeoff over breaking core navigation.
  return <canvas ref={canvasRef} className="h-full w-full" />;
}

/** Four small arrowheads pointing up/down/left/right around a center point
 * — a quiet, unlabeled d-pad silhouette dropped into the ambient icon
 * pattern at random, at the exact same 24x24 coordinate space and muted
 * styling as a real tech icon, so it never announces itself as a hint,
 * just something a closer look might recognize as directional. */
function drawDirectionalHint(ctx: CanvasRenderingContext2D) {
  const cx = 12;
  const cy = 12;
  const innerR = 4.5;
  const outerR = 10;
  const halfWidth = 2.6;
  const dirs: [number, number][] = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];
  for (const [dx, dy] of dirs) {
    const tipX = cx + dx * outerR;
    const tipY = cy + dy * outerR;
    const baseX = cx + dx * innerR;
    const baseY = cy + dy * innerR;
    const perpX = -dy * halfWidth;
    const perpY = dx * halfWidth;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(baseX + perpX, baseY + perpY);
    ctx.lineTo(baseX - perpX, baseY - perpY);
    ctx.closePath();
    ctx.fill();
  }
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

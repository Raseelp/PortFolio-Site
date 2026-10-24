"use client";

import { useEffect, useRef } from "react";

interface Crumb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  life: number;
  /** Seconds of life this crumb started with. */
  span: number;
  color: string;
}

interface Ring {
  x: number;
  y: number;
  age: number;
}

// The same colours the rest of the site uses: sun yellow most often, then the
// brand blue and a pale blue so crumbs still read over the blue game panel.
// Plain hex because a canvas fillStyle can't read a CSS var().
const COLORS = ["#ffc933", "#ffc933", "#ffd966", "#2f5bff", "#8fb4ff"];
const MAX_CRUMBS = 160;
const RING_SECONDS = 0.7;

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * The cursor's particles, in the site's own shape language: tiny rounded
 * squares (the same tiles the hero game board is made of) peel off the
 * pointer as it moves, tumble and shrink away. A click bursts a ring of them
 * outward with a Material-style ripple ring. One canvas, no per-particle DOM
 * nodes, and no animation frame running while nothing is alive.
 */
export function CursorSparks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const crumbs: Crumb[] = [];
    const rings: Ring[] = [];
    let last: { x: number; y: number } | null = null;
    let raf = 0;
    let lastT = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function spawn(x: number, y: number, vx: number, vy: number, size: number, span: number) {
      crumbs.push({
        x,
        y,
        vx,
        vy,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 8,
        size,
        life: span,
        span,
        color: pick(COLORS),
      });
      if (crumbs.length > MAX_CRUMBS) crumbs.splice(0, crumbs.length - MAX_CRUMBS);
    }

    function start() {
      if (!raf) {
        lastT = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }

    function handleMove(e: PointerEvent) {
      const prev = last;
      last = { x: e.clientX, y: e.clientY };
      if (!prev) return;
      const dist = Math.hypot(e.clientX - prev.x, e.clientY - prev.y);
      if (dist < 6) return;
      const count = Math.min(2, Math.floor(dist / 14) + 1);
      for (let i = 0; i < count; i++) {
        // They drift off backwards from the direction of travel, with a
        // little sideways scatter, so the pointer leaves a short tail.
        const back = Math.atan2(prev.y - e.clientY, prev.x - e.clientX) + (Math.random() - 0.5) * 1.4;
        const speed = 18 + Math.random() * 38;
        spawn(e.clientX, e.clientY, Math.cos(back) * speed, Math.sin(back) * speed + 6, 3 + Math.random() * 3.5, 0.55 + Math.random() * 0.45);
      }
      start();
    }

    function handleDown(e: PointerEvent) {
      rings.push({ x: e.clientX, y: e.clientY, age: 0 });
      for (let i = 0; i < 14; i++) {
        const a = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
        const speed = 90 + Math.random() * 130;
        spawn(e.clientX, e.clientY, Math.cos(a) * speed, Math.sin(a) * speed - 30, 4 + Math.random() * 5, 0.6 + Math.random() * 0.5);
      }
      start();
    }

    function tick(t: number) {
      const dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.age += dt;
        if (ring.age >= RING_SECONDS) {
          rings.splice(i, 1);
          continue;
        }
        const p = ring.age / RING_SECONDS;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, 6 + (1 - Math.pow(1 - p, 3)) * 46, 0, Math.PI * 2);
        ctx.strokeStyle = "#ffc933";
        ctx.globalAlpha = (1 - p) * 0.9;
        ctx.lineWidth = 3 * (1 - p) + 0.5;
        ctx.stroke();
      }

      const canRound = typeof ctx.roundRect === "function";
      for (let i = crumbs.length - 1; i >= 0; i--) {
        const c = crumbs[i];
        c.life -= dt;
        if (c.life <= 0) {
          crumbs.splice(i, 1);
          continue;
        }
        c.vx *= 1 - 2.2 * dt;
        c.vy = c.vy * (1 - 2.2 * dt) + 60 * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.rot += c.vr * dt;
        const k = c.life / c.span;
        const s = c.size * (0.35 + 0.65 * k);
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.globalAlpha = Math.min(1, k * 1.6);
        ctx.fillStyle = c.color;
        ctx.beginPath();
        if (canRound) ctx.roundRect(-s / 2, -s / 2, s, s, s * 0.32);
        else ctx.rect(-s / 2, -s / 2, s, s);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      if (crumbs.length || rings.length) raf = requestAnimationFrame(tick);
      else raf = 0;
    }

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handleDown, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleDown);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[99]" />;
}

# Muhammed Raseel P — Portfolio

This is my personal portfolio. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

I didn't want it to just be a static page of text and links, so the hero background is an interactive canvas with real pointer physics, and there's a fully playable Snake game hidden in it. There's also a small generative sound system if you turn the sound on. Everything else is the usual stuff — experience, tech stack, projects, education, contact.

## Features

- **Interactive hero** — a canvas background scattered with real tech-brand icons that push away from your cursor, plus a hidden Snake game (arrow keys / WASD / swipe / on-screen D-pad on mobile). Playing it (or crashing out) hijacks the hero tagline for a beat with a "GAME ON" / "GAME OVER" moment
- **Sound** — synthesized sound effects and generative background music that switches between calm and energetic depending on whether you're playing Snake, plus a licensed ambient track. All off by default, one click to turn on
- **Tech stack explorer** — a flow/browse toggle for my stack, using real brand icons in their real colors instead of a generic icon set
- **Selected Works** — project cards with a pointer-driven 3D tilt and a stats grid instead of a flat bullet list
- **No filler** — everything on here (experience, projects, stats) is real. Nothing's fabricated to look more impressive

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Motion (`motion/react`) · Phosphor Icons · Lenis (smooth scroll)

## Running it locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # ESLint
```

## Structure

```
src/
  app/            # routes, metadata, favicon/OG-image/robots/sitemap
  components/     # page sections and UI components
  lib/            # content data, sound/music engines, shared hooks
```

All the actual content (my profile, experience, projects, skills, education) lives in `src/lib/content.ts` if you're curious how it's wired up.

---

© Muhammed Raseel P. Feel free to look through the code, but it's not licensed for reuse.

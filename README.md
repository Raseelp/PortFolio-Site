# Muhammed Raseel P — Portfolio

Personal portfolio site for [Muhammed Raseel P](https://github.com/Raseelp), a Flutter developer. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

It's a single-page site, but not a static brochure — the hero background is an interactive canvas with real pointer physics, a fully playable hidden Snake game, and a small generative sound system, alongside the usual portfolio sections (experience, tech stack, projects, education, contact).

## Features

- **Interactive hero** — a canvas widget-grid background scattered with real tech-brand icons that repel from the cursor, plus a hidden, fully playable **Snake game** (arrow keys / WASD / swipe / on-screen D-pad on mobile), complete with festival-themed win/lose moments and a snake-vs-text letter collider on the rotating hero tagline
- **Sound design** — synthesized SFX and generative background music (calm/energetic modes tied to the game), plus a licensed ambient bed, all behind an explicit mute toggle (off by default)
- **Tech stack explorer** — a flow/browse toggle view of the stack, each icon a real Simple Icons brand mark in its real brand color
- **Selected Works** — project cards with a pointer-driven 3D tilt, a varied stats grid, and technical stack tags
- **Real content only** — no filler copy, no fabricated metrics; experience, projects, and stats all come from `src/lib/content.ts`

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Motion (`motion/react`) · Phosphor Icons · Lenis (smooth scroll)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # ESLint
```

## Project structure

```
src/
  app/            # routes, metadata, favicon/OG-image/robots/sitemap
  components/     # page sections and UI components
  lib/            # content data, sound/music engines, shared hooks
```

All real content (profile, experience, projects, skills, education) lives in `src/lib/content.ts`.

---

© Muhammed Raseel P. Source available for reference; not licensed for reuse.

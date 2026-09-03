import { TECH_BRAND_COLORS, type TechIconSlug } from "@/lib/techIcons";

export type Direction = "up" | "down" | "left" | "right";

interface Segment {
  col: number;
  row: number;
  /** Which real tech icon this segment was earned by eating. */
  slug: TechIconSlug | null;
}

// Food appears in roughly the order these were actually picked up — the
// internship stack first, then the current job's, so a clean run visually
// retells how the stack grew instead of feeding at random.
const FOOD_ORDER: TechIconSlug[] = ["git", "kotlin", "android", "dart", "flutter", "getx", "firebase", "figma"];

// The snake never starts as a bare, blank dot — it already carries the
// baseline it always had, head included, so there's something colorful to
// look at before a single food is even eaten.
const STARTER_TRAIL: TechIconSlug[] = ["flutter", "dart", "git"];

const TICK_MS_ATTRACT = 260;
const TICK_MS_PLAYER = 150;
export const GAME_OVER_HOLD_MS = 1400;
const OPPOSITE: Record<Direction, Direction> = { up: "down", down: "up", left: "right", right: "left" };
// How often idle wandering drifts toward the cursor instead of the food —
// a small, wordless "it notices you're there" cue meant to read as the
// grid being alive and responsive, the kind of thing that makes someone
// idly nudge their mouse around and then, out of curiosity, try an arrow
// key. Never explained anywhere; the behavior is the whole hint.
const CURSOR_CURIOSITY_CHANCE = 0.4;

function wrapDelta(d: number, size: number): number {
  if (Math.abs(d) > size / 2) return d > 0 ? d - size : d + size;
  return d;
}

/**
 * Snake, played out on the hero's own widget grid. Not a separate overlay —
 * it moves on the exact same CELL/GAP cells the ambient tiles already use.
 * Starts already a few segments long (its real starter stack), never a bare
 * dot. Idles in a slow "attract mode" (an AI chases food, occasionally
 * drifting toward the cursor instead — see CURSOR_CURIOSITY_CHANCE) until
 * the visitor actually presses a direction or swipes, at which point a real
 * run starts at normal speed with self-collision. Growth is unconditional —
 * eating grows the snake whether or not anyone's steering it. Each segment
 * it eats keeps that icon's real brand color permanently, so the snake
 * becomes a visible chain of the stack it's "eaten" rather than a plain
 * colored worm. Edges wrap (Pac-Man style); running into its own body during
 * a real run resets back to attract mode after a short beat.
 */
export class SnakeGame {
  cols = 0;
  rows = 0;
  /** Rows nearest the top to keep off-limits for food — the sound/snake
   * toggle buttons live there in fixed screen position, and food spawning
   * underneath them would be genuinely invisible. Set from measured pixel
   * height by the caller (see BgWidgetGrid.tsx), not a fixed guess, so it
   * still lines up if that header UI ever changes size. */
  topSafeRows = 0;
  body: Segment[] = [];
  dir: Direction = "right";
  private pendingDir: Direction = "right";
  food: { col: number; row: number; slug: TechIconSlug } | null = null;
  private foodIndex = 0;
  armed = false;
  private gameOver = false;
  private accumMs = 0;
  private gameOverMs = 0;
  private cursorCell: { col: number; row: number } | null = null;
  /** Cells to burst particles at, drained once per frame by the caller —
   * lets the canvas's own spark system react to an eat without this class
   * needing to know anything about pixels/canvas. `pitchStep` is the
   * FOOD_ORDER index at the moment of eating, for the caller's eat sound to
   * climb in pitch across a clean run instead of repeating one note. */
  private pendingBursts: { col: number; row: number; color: string; pitchStep: number }[] = [];
  /** Fired exactly once at each "start" (attract mode → a real, steered run)
   * and "gameover" (self-collision) transition — not a running score, just
   * the two moments the hero tagline hijacks for its own callout. */
  onEvent?: (event: "start" | "gameover") => void;

  resize(cols: number, rows: number) {
    if (cols === this.cols && rows === this.rows && this.body.length > 0) return;
    this.cols = cols;
    this.rows = rows;
    this.reset();
  }

  private reset() {
    if (this.cols <= 0 || this.rows <= 0) return;
    const startCol = Math.floor(this.cols / 2);
    const startRow = Math.floor(this.rows / 2);
    this.body = STARTER_TRAIL.map((slug, i) => ({
      col: (((startCol - i) % this.cols) + this.cols) % this.cols,
      row: startRow,
      slug,
    }));
    this.dir = "right";
    this.pendingDir = "right";
    this.gameOver = false;
    this.gameOverMs = 0;
    this.spawnFood();
  }

  /** Called once per frame by the canvas; returns and clears any bursts
   * queued since the last call. */
  drainBursts(): { col: number; row: number; color: string; pitchStep: number }[] {
    if (this.pendingBursts.length === 0) return this.pendingBursts;
    const out = this.pendingBursts;
    this.pendingBursts = [];
    return out;
  }

  /** Called once per frame with the cursor's current grid cell (or null
   * when not hovering) — feeds the idle wander's cursor-curiosity. */
  setCursor(col: number | null, row: number | null) {
    this.cursorCell = col != null && row != null ? { col, row } : null;
  }

  private spawnFood() {
    const slug = FOOD_ORDER[this.foodIndex % FOOD_ORDER.length];
    // Never leave fewer than 2 playable rows — a very short canvas (a tiny
    // landscape phone, say) shouldn't be able to make food unspawnable.
    const safeRows = Math.min(this.topSafeRows, Math.max(0, this.rows - 2));
    let col = 0;
    let row = 0;
    let attempts = 0;
    do {
      col = Math.floor(Math.random() * this.cols);
      row = safeRows + Math.floor(Math.random() * (this.rows - safeRows));
      attempts++;
    } while (this.body.some((s) => s.col === col && s.row === row) && attempts < 40);
    this.food = { col, row, slug };
  }

  /** Called on a real keypress or swipe. First call switches attract mode
   * into a real run. */
  setDirection(dir: Direction) {
    if (!this.armed && !this.gameOver) this.forceStart();
    if (OPPOSITE[this.dir] === dir) return;
    this.pendingDir = dir;
  }

  /** Arms a fresh run immediately, with no direction needed first — what
   * the visible Snake toggle button calls instead of waiting for an arrow
   * key. Idempotent while already armed. */
  forceStart() {
    if (this.armed) return;
    this.armed = true;
    this.gameOver = false;
    this.reset();
    this.onEvent?.("start");
  }

  /** Ends the current run immediately without the collision framing — the
   * toggle button's "stop" side. Deliberately fires no event: this isn't a
   * loss, so no "GAME OVER" sound/text and no music mode change (the caller
   * that's hiding the game handles reverting the music itself). */
  forceStop() {
    this.armed = false;
    this.gameOver = false;
  }

  private attractStep() {
    if (this.body.length === 0) return;
    const head = this.body[0];
    const target = this.cursorCell && Math.random() < CURSOR_CURIOSITY_CHANCE ? this.cursorCell : this.food;
    if (!target) return;
    const dx = wrapDelta(target.col - head.col, this.cols);
    const dy = wrapDelta(target.row - head.row, this.rows);
    const candidates: Direction[] =
      Math.abs(dx) > Math.abs(dy)
        ? [dx > 0 ? "right" : "left", dy > 0 ? "down" : "up"]
        : [dy > 0 ? "down" : "up", dx > 0 ? "right" : "left"];
    for (const c of candidates) {
      if (OPPOSITE[this.dir] !== c) {
        this.pendingDir = c;
        return;
      }
    }
  }

  tick(dtMs: number) {
    if (this.gameOver) {
      this.gameOverMs += dtMs;
      if (this.gameOverMs > GAME_OVER_HOLD_MS) {
        this.armed = false;
        this.reset();
      }
      return;
    }

    this.accumMs += dtMs;
    const tickRate = this.armed ? TICK_MS_PLAYER : TICK_MS_ATTRACT;
    if (this.accumMs < tickRate || this.cols === 0) return;
    this.accumMs = 0;

    if (!this.armed) this.attractStep();
    this.dir = this.pendingDir;

    const head = this.body[0];
    let col = head.col;
    let row = head.row;
    if (this.dir === "up") row -= 1;
    else if (this.dir === "down") row += 1;
    else if (this.dir === "left") col -= 1;
    else col += 1;
    col = (col + this.cols) % this.cols;
    row = (row + this.rows) % this.rows;

    // Attract mode never checks self-collision — it's ambient wandering,
    // not a fair game, and a long trail would otherwise tangle on itself
    // constantly while turning.
    if (this.armed && this.body.some((s) => s.col === col && s.row === row)) {
      this.gameOver = true;
      this.onEvent?.("gameover");
      return;
    }

    const ateFood = this.food && this.food.col === col && this.food.row === row;
    if (ateFood && this.food) {
      // Growth is unconditional — eating grows the snake whether a real
      // run is steering it or it's just idly wandering on its own.
      this.body.unshift({ col, row, slug: this.food.slug });
      this.pendingBursts.push({
        col,
        row,
        color: TECH_BRAND_COLORS[this.food.slug] ?? "#ffffff",
        pitchStep: this.foodIndex,
      });
      this.foodIndex += 1;
      this.spawnFood();
    } else {
      this.shiftBody(col, row);
    }
  }

  /** Moves every segment forward by one step without growing: each
   * segment's own earned color is permanently tied to its array slot and
   * must never be reassigned here — only its position moves, stepping into
   * the position the segment ahead of it (toward the head) previously
   * held, same as real snake motion. (Copying `{...body[i-1]}` in full —
   * slug included — was an earlier bug: it cascaded the head's color down
   * the whole body within a few ticks instead of leaving each segment's
   * color alone.) */
  private shiftBody(col: number, row: number) {
    for (let i = this.body.length - 1; i > 0; i--) {
      this.body[i] = { ...this.body[i], col: this.body[i - 1].col, row: this.body[i - 1].row };
    }
    this.body[0] = { ...this.body[0], col, row };
  }

  draw(
    ctx: CanvasRenderingContext2D,
    iconPaths: Record<string, Path2D>,
    cell: number,
    gap: number,
    time: number
  ) {
    const step = cell + gap;
    const toXY = (col: number, row: number) => [col * step + cell / 2, row * step + cell / 2] as const;

    // Food — real icon, real brand color, a deliberately loud pulse (a
    // breathing glow ring behind it, plus its own size pulse) so it's the
    // first thing your eye catches on the grid, not something you have to
    // hunt for.
    if (this.food) {
      const [fx, fy] = toXY(this.food.col, this.food.row);
      const color = TECH_BRAND_COLORS[this.food.slug] ?? "#ffffff";
      const pulse = Math.sin(time * 5) * 0.5 + 0.5; // 0..1
      const ringRadius = 14 + pulse * 8;

      ctx.save();
      ctx.beginPath();
      ctx.arc(fx, fy, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.5 - pulse * 0.3;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      const size = 20 + pulse * 3;
      ctx.save();
      ctx.translate(fx - size / 2, fy - size / 2);
      ctx.scale(size / 24, size / 24);
      ctx.shadowColor = color;
      ctx.shadowBlur = 20 + pulse * 10;
      ctx.fillStyle = color;
      ctx.fill(iconPaths[this.food.slug]);
      ctx.restore();
    }

    // A connecting line strung through every segment center first, so it
    // reads as one continuous body rather than a scatter of separate icons
    // with gaps between grid cells — each stretch tinted toward the
    // segment it's leading into.
    for (let i = 0; i < this.body.length - 1; i++) {
      const a = this.body[i];
      const b = this.body[i + 1];
      const [ax, ay] = toXY(a.col, a.row);
      const [bx, by] = toXY(b.col, b.row);
      if (Math.hypot(bx - ax, by - ay) > cell + gap + 4) continue; // wrapped across an edge — don't draw a line across the whole grid
      const color = TECH_BRAND_COLORS[a.slug ?? (b.slug as TechIconSlug)] ?? "#ffffff";
      ctx.save();
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.restore();
    }

    // Body — each segment in its own real brand color (the starter trail
    // included, so it's never a bare dot). A gentle per-segment scale wave
    // gives it a slither, rather than every segment holding dead still
    // between grid steps.
    for (let i = this.body.length - 1; i >= 0; i--) {
      const seg = this.body[i];
      const isHead = i === 0;
      const [sx, sy] = toXY(seg.col, seg.row);
      const wave = 1 + Math.sin(time * 5 - i * 0.7) * 0.1;
      const size = (isHead ? 21 : 16) * wave;

      ctx.save();
      if (seg.slug) {
        const color = TECH_BRAND_COLORS[seg.slug] ?? "#ffffff";
        ctx.translate(sx - size / 2, sy - size / 2);
        ctx.scale(size / 24, size / 24);
        ctx.shadowColor = color;
        ctx.shadowBlur = isHead ? 12 : 4;
        ctx.fillStyle = color;
        ctx.fill(iconPaths[seg.slug]);
      } else {
        ctx.beginPath();
        ctx.fillStyle = isHead ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.28)";
        ctx.arc(sx, sy, size * 0.24, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

import { Pixels } from "./Pixels";
import { Reveal } from "./Reveal";

/**
 * A left-aligned section opener: a small mono label with a short rule, then a
 * sentence heading whose last words get a yellow highlighter swipe, then one
 * muted line. `lead` is the plain part, `mark` the highlighted tail; the
 * whole thing is the section's real <h2>.
 */
export function SectionHeading({
  eyebrow,
  lead,
  mark,
  sub,
  sparks = false,
  className = "",
}: {
  eyebrow: string;
  lead: string;
  mark: string;
  sub?: string;
  /** Adds a few loose grid tiles after the highlighted words. */
  sparks?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={`flex flex-col items-start ${className}`}>
      <p className="flex items-center gap-3 font-mono text-[12.5px] font-medium uppercase tracking-[0.16em] text-accent-deep">
        <span aria-hidden className="h-px w-8 bg-accent" />
        {eyebrow}
      </p>
      <h2 className="mt-5 max-w-3xl text-balance font-display text-[clamp(2.25rem,6vw,4.25rem)] font-bold leading-[1.05] tracking-[-0.035em] text-fg">
        {lead}{" "}
        <span className="relative">
          <span className="marker">{mark}</span>
          {sparks && <Pixels pattern="trail" className="-right-12 -top-7 hidden md:grid" />}
        </span>
      </h2>
      {sub && <p className="mt-4 max-w-xl text-balance text-lg leading-snug text-fg-muted">{sub}</p>}
    </Reveal>
  );
}

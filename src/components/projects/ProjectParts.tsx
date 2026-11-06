import { TechIcon } from "../ui/TechIcon";
import { TECH_LABEL_ICONS, TECH_BRAND_COLORS, type TechIconSlug } from "@/lib/techIcons";

export function slugsFor(tech: string): TechIconSlug[] {
  const slugs = TECH_LABEL_ICONS[tech];
  return Array.isArray(slugs) ? slugs : slugs ? [slugs] : [];
}

/** A mono date with a short yellow bar in front. */
export function ProjectDate({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[12.5px] font-medium uppercase tracking-[0.14em] text-fg-muted">
      <span aria-hidden className="h-[3px] w-7 rounded-full bg-accent-gold" />
      {children}
    </p>
  );
}

/** Facts as a list with hairline dividers and small blue diamond bullets. */
export function StatList({ stats, columns = 1 }: { stats: string[]; columns?: 1 | 2 }) {
  return (
    <ul className={`grid border-t border-border ${columns === 2 ? "sm:grid-cols-2 sm:gap-x-10" : ""}`}>
      {stats.map((stat) => (
        <li key={stat} className="flex items-start gap-4 border-b border-border py-3">
          <span aria-hidden className="mt-[7px] h-2 w-2 shrink-0 rotate-45 bg-accent" />
          <span className="text-[14.5px] font-medium leading-snug text-fg">{stat}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The stack as plain text, with a tiny brand-colored tile in front when a
 * verified brand icon exists. No pill, so a long stack reads as a line of
 * text instead of a wall of chips.
 */
export function StackList({ stack }: { stack: string[] }) {
  return (
    <div>
      <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.16em] text-fg-faint">Built with</p>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2.5">
        {stack.map((tech) => {
          const list = slugsFor(tech);
          const color = list[0] ? TECH_BRAND_COLORS[list[0]] : undefined;
          return (
            <li key={tech} className="inline-flex items-center gap-2 text-[14px] font-semibold text-fg">
              {list.length > 0 && (
                <span
                  aria-hidden
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px]"
                  style={{ background: color ?? "var(--fg-muted)" }}
                >
                  {list.map((slug) => (
                    <TechIcon key={slug} slug={slug} size={11} className="text-white" />
                  ))}
                </span>
              )}
              {tech}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

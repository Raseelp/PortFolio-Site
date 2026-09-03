import { Lightning, ChartLineUp, ShieldCheck, GitBranch } from "@phosphor-icons/react/dist/ssr";
import { RevealGroup, RevealItem } from "../../ui/Reveal";
import { TechIcon } from "../../ui/TechIcon";
import { ProjectMedia } from "../ProjectMedia";
import { ProjectLinkButtons } from "../ProjectLinkButtons";
import { TiltCard } from "./TiltCard";
import { TECH_LABEL_ICONS, TECH_BRAND_COLORS, type TechIconSlug } from "@/lib/techIcons";
import type { Project } from "@/lib/content";

/** Each project's phone lights the card with its own accent — Selected
 * Works already has a warm/gold pairing for exactly this job (see
 * globals.css), reused here instead of inventing a third hue. */
const GLOWS = ["var(--accent-warm)", "var(--accent-gold)"];

/** Rotating glyphs for the stats grid. The stats are free-text sentences,
 * not a typed taxonomy, so these are cycled by index rather than matched to
 * each sentence's wording — the point is that no two rows in a row read
 * identically, not that the icon "means" the exact stat next to it. */
const STAT_ICONS = [Lightning, ChartLineUp, ShieldCheck, GitBranch];

/**
 * A stack entry rendered as a small technical tag rather than the pill
 * badge used elsewhere on the site (TechChip, in the Stack section) — a
 * rectangular label with a brand-tinted glyph plate and a mono/uppercase
 * caption, matching this card's own eyebrow typography instead of
 * repeating the nav-style pill everywhere.
 */
function StackTag({ tech }: { tech: string }) {
  const slugs = TECH_LABEL_ICONS[tech];
  const list = Array.isArray(slugs) ? slugs : slugs ? [slugs] : [];
  const primary = list[0] as TechIconSlug | undefined;
  const color = primary ? TECH_BRAND_COLORS[primary] : "var(--fg-muted)";

  return (
    <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[9px] border border-border-strong bg-bg-raised-2/50 py-1.5 pl-1.5 pr-3">
      {list.length > 0 && (
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px]"
          style={{ background: `color-mix(in srgb, ${color} 18%, transparent)` }}
        >
          <span style={{ color }} className="flex items-center gap-0.5">
            {list.map((slug) => (
              <TechIcon key={slug} slug={slug} size={12} />
            ))}
          </span>
        </span>
      )}
      <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-fg-muted">
        {tech}
      </span>
    </span>
  );
}

export function PhoneCards({ projects }: { projects: Project[] }) {
  return (
    <RevealGroup className="flex flex-col gap-10">
      {projects.map((project, i) => {
        const glow = GLOWS[i % GLOWS.length];
        return (
          <RevealItem key={project.name}>
            <TiltCard className="group relative overflow-hidden rounded-[var(--radius-panel)] border border-border bg-bg-raised transition-colors duration-300 hover:border-border-strong">
              {/* Hairline accent seam along the top edge — the card's one
                  signature detail, tinted per project instead of the same
                  flat neutral border every other panel on the site uses. */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 z-10 h-px opacity-70"
                style={{ background: `linear-gradient(90deg, transparent, ${glow}, transparent)` }}
              />

              <div className="relative flex flex-col md:flex-row">
                {/* Media bay — its own tinted zone behind a shared border,
                    so the phone sits in a distinct material rather than
                    floating on the same flat panel as the copy. */}
                <div
                  className="relative flex shrink-0 items-center justify-center overflow-hidden border-b border-border/60 p-8 md:w-[280px] md:border-b-0 md:border-r md:p-10"
                  style={{ background: `color-mix(in srgb, ${glow} 7%, var(--bg-raised))` }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-70"
                    style={{
                      background: `radial-gradient(120% 90% at 50% 15%, color-mix(in srgb, ${glow} 18%, transparent), transparent 70%)`,
                    }}
                  />

                  <div className="relative mx-auto shrink-0">
                    <div className="w-[190px] rounded-[32px] border-[6px] border-bg-raised-2 bg-bg-raised-2 p-1.5 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.65)] transition-transform duration-500 group-hover:-translate-y-1.5">
                      <div className="relative">
                        <span
                          aria-hidden
                          className="absolute left-1/2 top-2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-bg-raised-2"
                        />
                        <ProjectMedia videoUrl={project.previewVideo} className="aspect-[9/19] rounded-[24px]" />
                      </div>
                    </div>
                    {/* Side buttons */}
                    <span aria-hidden className="absolute -left-[7px] top-16 h-8 w-[3px] rounded-full bg-bg-raised-2" />
                    <span aria-hidden className="absolute -right-[7px] top-24 h-12 w-[3px] rounded-full bg-bg-raised-2" />
                  </div>
                </div>

                {/* Content pane */}
                <div className="relative min-w-0 flex-1 p-6 md:p-9">
                  {/* Giant watermark index — the sequence number as a real
                      typographic device, not a decorative sticker. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-4 -top-10 select-none font-sans text-[13rem] font-extrabold leading-none text-fg/[0.03] md:text-[16rem]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="relative flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: glow }}>
                        {String(i + 1).padStart(2, "0")} · {project.date}
                      </span>
                      <h3 className="mt-1 text-xl font-bold tracking-tight text-fg md:text-2xl">{project.name}</h3>
                      <p className="mt-1.5 max-w-[52ch] text-[14.5px] leading-relaxed text-fg-muted">
                        {project.tagline}
                      </p>
                    </div>
                    <ProjectLinkButtons />
                  </div>

                  <p className="relative mt-5 max-w-[60ch] text-[14.5px] leading-relaxed text-fg-muted">
                    {project.description}
                  </p>

                  <ul className="relative mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {project.stats.map((stat, si) => {
                      const Icon = STAT_ICONS[si % STAT_ICONS.length];
                      const tinted = si % 2 === 0;
                      return (
                        <li
                          key={stat}
                          className="flex items-start gap-2.5 rounded-[14px] border border-border/70 px-3 py-2.5"
                          style={{
                            background: tinted ? `color-mix(in srgb, ${glow} 6%, transparent)` : "transparent",
                          }}
                        >
                          <span
                            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px]"
                            style={{ background: `color-mix(in srgb, ${glow} 16%, transparent)` }}
                          >
                            <Icon size={13} weight="bold" style={{ color: glow }} />
                          </span>
                          <span className="text-[13px] leading-snug text-fg-muted">{stat}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="relative mt-5 flex flex-wrap gap-2">
                    {project.stack.map((tech) => (
                      <StackTag key={tech} tech={tech} />
                    ))}
                  </div>
                </div>
              </div>
            </TiltCard>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}

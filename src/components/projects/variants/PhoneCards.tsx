import { RevealGroup, RevealItem } from "../../ui/Reveal";
import { TechIcon } from "../../ui/TechIcon";
import { FloatBadge } from "../../ui/FloatBadge";
import { InspectorOverlay } from "../../ui/InspectorOverlay";
import { ProjectMedia } from "../ProjectMedia";
import { ProjectLinkButtons } from "../ProjectLinkButtons";
import { TiltCard } from "./TiltCard";
import { TECH_LABEL_ICONS, TECH_BRAND_COLORS, type TechIconSlug } from "@/lib/techIcons";
import type { Project } from "@/lib/content";

function slugsFor(tech: string): TechIconSlug[] {
  const slugs = TECH_LABEL_ICONS[tech];
  return Array.isArray(slugs) ? slugs : slugs ? [slugs] : [];
}

/**
 * A stack entry as plain text, with a tiny brand-colored tile in front when
 * a verified brand icon exists. No pill, so a long stack reads as a line of
 * text instead of a wall of chips.
 */
function StackItem({ tech }: { tech: string }) {
  const list = slugsFor(tech);
  const primary = list[0];
  const color = primary ? TECH_BRAND_COLORS[primary] : undefined;

  return (
    <li className="inline-flex items-center gap-2 text-[14px] font-semibold text-fg">
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
}

export function PhoneCards({ projects }: { projects: Project[] }) {
  return (
    <RevealGroup className="flex flex-col gap-6 md:gap-8" amount="some">
      {projects.map((project, i) => {
        const badgeSlugs = Array.from(new Set(project.stack.flatMap(slugsFor))).slice(0, 2);
        return (
          <RevealItem key={project.name} className="insp-host relative">
            <InspectorOverlay label="Card" />
            <TiltCard className="group relative overflow-hidden rounded-[1.75rem] bg-white p-3 shadow-[var(--shadow-card)] transition-shadow duration-500 hover:shadow-[var(--shadow-card-hover)] md:rounded-[2rem] md:p-4">
              <div className={`flex flex-col gap-3 md:gap-6 ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"}`}>
                {/* Blue bay: the phone sits in its own rounded panel with
                    two app-icon tiles floating beside it. */}
                <div className="accent-panel relative flex shrink-0 items-center justify-center overflow-hidden rounded-[1.25rem] px-6 py-12 md:w-[360px] md:rounded-[1.5rem] md:py-14">
                  {badgeSlugs[0] && <FloatBadge slug={badgeSlugs[0]} className="left-5 top-6 md:left-7" delay="0s" tilt={-10} />}
                  {badgeSlugs[1] && <FloatBadge slug={badgeSlugs[1]} className="bottom-8 right-5 md:right-7" delay="-2.2s" tilt={9} />}

                  <div className="relative">
                    <div className="w-[190px] rounded-[2.2rem] border-[6px] border-[#151517] bg-[#151517] p-1.5 shadow-[0_30px_50px_-18px_rgba(10,15,100,0.65)] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-2">
                      <div className="relative">
                        <span
                          aria-hidden
                          className="absolute left-1/2 top-2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-[#151517]"
                        />
                        <ProjectMedia videoUrl={project.previewVideo} className="aspect-[9/19] rounded-[1.7rem]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1 p-4 md:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                    <p className="flex items-center gap-3 font-mono text-[12.5px] font-medium uppercase tracking-[0.14em] text-fg-muted">
                      <span aria-hidden className="h-[3px] w-7 rounded-full bg-accent-gold" />
                      {project.date}
                    </p>
                    <ProjectLinkButtons repo={project.repo} />
                  </div>

                  <h3 className="mt-6 font-display text-[1.9rem] font-bold leading-[1.08] tracking-[-0.03em] text-fg md:text-[2.4rem]">
                    {project.name}
                  </h3>
                  <p className="mt-4 max-w-[52ch] text-[17px] font-medium leading-snug text-fg">{project.tagline}</p>
                  <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-fg-muted">{project.description}</p>

                  <ul className="mt-7 divide-y divide-border border-y border-border">
                    {project.stats.map((stat) => (
                      <li key={stat} className="flex items-start gap-4 py-3">
                        <span aria-hidden className="mt-[7px] h-2 w-2 shrink-0 rotate-45 bg-accent" />
                        <span className="text-[14.5px] font-medium leading-snug text-fg">{stat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.16em] text-fg-faint">Built with</p>
                    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2.5">
                      {project.stack.map((tech) => (
                        <StackItem key={tech} tech={tech} />
                      ))}
                    </ul>
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

import { Container } from "./ui/Container";
import { InspectorOverlay } from "./ui/InspectorOverlay";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";
import { Timeline, TimelineEntry } from "./ui/Timeline";
import { TechIcon } from "./ui/TechIcon";
import { experience } from "@/lib/content";
import type { AchievementGroup } from "./experience/types";
import { BranchTimeline } from "./experience/BranchTimeline";
import { TECH_BRAND_COLORS } from "@/lib/techIcons";

export function Experience() {
  return (
    <section id="experience" className="py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow="Experience" lead="Where I've" mark="worked" sub="And what I shipped there." />

        <Reveal delay={0.1} className="insp-host relative mt-12 rounded-[2rem] bg-white p-6 shadow-[var(--shadow-card)] md:mt-16 md:rounded-[2.5rem] md:p-12">
          <InspectorOverlay label="Timeline" tagSide="right" />
          <Timeline>
            {experience.map((entry) => {
              const groups: AchievementGroup[] = entry.subEntries
                ? entry.subEntries.map((sub) => ({
                    name: sub.name,
                    tech: sub.tech,
                    achievements: sub.achievements,
                    links: sub.links,
                  }))
                : entry.achievements
                  ? [{ tech: entry.tech, achievements: entry.achievements }]
                  : [];

              const isCurrent = entry.dates.toLowerCase().includes("present");
              const stack = Array.from(new Set(groups.flatMap((g) => g.tech ?? [])));

              return (
                <TimelineEntry
                  key={entry.company}
                  date={entry.dates}
                  title={entry.role}
                  org={entry.company}
                  location={entry.location}
                  belowFull={groups.length > 0 ? <BranchTimeline groups={groups} /> : undefined}
                >
                  {/* Header meta row — grounds the role/company text (which
                      used to just float above the branch diagram) with the
                      two things that actually matter at a glance: whether
                      this is the current job, and what real stack it used. */}
                  {(isCurrent || stack.length > 0) && (
                    <div className="flex flex-wrap items-center gap-3">
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[12px] font-semibold text-accent-deep">
                          <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-accent" />
                          Current role
                        </span>
                      )}
                      {stack.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          {stack.map((slug) => (
                            <span
                              key={slug}
                              className="flex h-6 w-6 items-center justify-center rounded-[8px] ring-2 ring-white"
                              style={{ background: TECH_BRAND_COLORS[slug] ?? "var(--bg-raised-2)" }}
                              title={slug}
                            >
                              <TechIcon slug={slug} size={12} className="text-white" />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {entry.summary && (
                    <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-fg-muted">
                      {entry.summary}
                    </p>
                  )}
                </TimelineEntry>
              );
            })}
          </Timeline>
        </Reveal>
      </Container>
    </section>
  );
}

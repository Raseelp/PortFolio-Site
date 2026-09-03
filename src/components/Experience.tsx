import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { Timeline, TimelineEntry } from "./ui/Timeline";
import { TechIcon } from "./ui/TechIcon";
import { experience } from "@/lib/content";
import type { AchievementGroup } from "./experience/types";
import { BranchTimeline } from "./experience/BranchTimeline";
import { TECH_BRAND_COLORS } from "@/lib/techIcons";

export function Experience() {
  return (
    <section id="experience" className="bg-bg py-20 md:py-28">
      <Container>
        <Reveal>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Work experience
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg md:text-4xl">
            Where I&apos;ve worked
          </h2>
        </Reveal>

        <div className="mt-14">
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
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
                          <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-accent" />
                          Current role
                        </span>
                      )}
                      {stack.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          {stack.map((slug) => (
                            <span
                              key={slug}
                              className="flex h-5 w-5 items-center justify-center rounded-full"
                              style={{ background: TECH_BRAND_COLORS[slug] ?? "var(--bg-raised-2)" }}
                              title={slug}
                            >
                              <TechIcon slug={slug} size={11} className="text-white" />
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
        </div>
      </Container>
    </section>
  );
}

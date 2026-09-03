import { Trophy } from "@phosphor-icons/react/dist/ssr";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { Timeline, TimelineEntry } from "./ui/Timeline";
import { education, achievement } from "@/lib/content";

export function Education() {
  return (
    <section id="education" className="bg-bg py-20 md:py-28">
      <Container>
        <Reveal>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Education
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg md:text-4xl">
            Where it started
          </h2>
        </Reveal>

        <div className="mt-14">
          <Timeline>
            {education.map((entry) => (
              <TimelineEntry
                key={entry.school}
                date={entry.dates}
                title={entry.degree}
                org={entry.school}
                location={entry.location}
              >
                {entry.note && <p className="text-[13px] text-fg-faint">{entry.note}</p>}
              </TimelineEntry>
            ))}
          </Timeline>
        </div>

        <Reveal delay={0.1} className="mt-10 pl-9 md:pl-12">
          <div className="flex items-start gap-3 rounded-[var(--radius-panel-inner)] border border-accent-soft-border bg-accent-soft p-5">
            <Trophy size={20} weight="fill" className="mt-0.5 shrink-0 text-accent" />
            <p className="text-[14.5px] leading-relaxed text-fg">{achievement}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

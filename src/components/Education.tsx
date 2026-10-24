import { Trophy } from "@phosphor-icons/react/dist/ssr";
import { Container } from "./ui/Container";
import { InspectorOverlay } from "./ui/InspectorOverlay";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";
import { Timeline, TimelineEntry } from "./ui/Timeline";
import { education, achievement } from "@/lib/content";

export function Education() {
  return (
    <section id="education" className="py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow="Education" lead="Where it" mark="started" sub="The classroom side of the story." />

        <Reveal delay={0.1} className="insp-host relative mt-12 rounded-[2rem] bg-white p-6 shadow-[var(--shadow-card)] md:mt-16 md:rounded-[2.5rem] md:p-12">
          <InspectorOverlay label="Timeline" tagSide="right" />
          <Timeline>
            {education.map((entry) => (
              <TimelineEntry
                key={entry.school}
                date={entry.dates}
                title={entry.degree}
                org={entry.school}
                location={entry.location}
              >
                {entry.note && <p className="text-[13px] font-medium text-fg-faint">{entry.note}</p>}
              </TimelineEntry>
            ))}
          </Timeline>
        </Reveal>

        <Reveal delay={0.15} className="mt-6 flex justify-center">
          <div className="inline-flex max-w-2xl items-center gap-3 rounded-[1.75rem] bg-fg py-3 pl-3 pr-6 text-white shadow-[var(--shadow-float)] md:rounded-full">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent">
              <Trophy size={18} weight="fill" className="text-white" />
            </span>
            <p className="text-[14.5px] font-semibold leading-snug">{achievement}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

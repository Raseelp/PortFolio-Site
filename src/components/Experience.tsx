import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { experience } from "@/lib/content";

export function Experience() {
  return (
    <section id="experience" className="py-20 md:py-28">
      <Container>
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
            Experience
          </h2>
        </Reveal>

        <div className="mt-12 divide-y divide-border border-t border-border">
          {experience.map((entry, i) => (
            <Reveal key={entry.company} delay={i * 0.05} className="py-10 first:pt-0 md:py-12">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-fg">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {entry.company}
                  </h3>
                  <p className="mt-1 text-[14px] text-fg-muted">{entry.role}</p>
                  <p className="mt-3 font-mono text-[13px] text-fg-faint">
                    {entry.dates}
                  </p>
                  <p className="text-[13px] text-fg-faint">{entry.location}</p>
                </div>

                <div className="md:col-span-8">
                  {entry.summary && (
                    <p className="max-w-[65ch] text-[15px] leading-relaxed text-fg-muted">
                      {entry.summary}
                    </p>
                  )}

                  {entry.subEntries && (
                    <div className="mt-6 flex flex-col gap-8">
                      {entry.subEntries.map((sub) => (
                        <div key={sub.name}>
                          <h4 className="text-[14px] font-medium text-fg">
                            {sub.name}
                          </h4>
                          <ul className="mt-3 flex flex-col gap-2.5">
                            {sub.bullets.map((bullet, bi) => (
                              <li
                                key={bi}
                                className="flex gap-3 text-[15px] leading-relaxed text-fg-muted"
                              >
                                <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-fg-faint" />
                                <span className="max-w-[60ch]">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {entry.bullets && (
                    <ul className="mt-2 flex flex-col gap-2.5">
                      {entry.bullets.map((bullet, bi) => (
                        <li
                          key={bi}
                          className="flex gap-3 text-[15px] leading-relaxed text-fg-muted"
                        >
                          <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-fg-faint" />
                          <span className="max-w-[60ch]">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

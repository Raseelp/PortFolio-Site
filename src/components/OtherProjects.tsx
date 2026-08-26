import { Container } from "./ui/Container";
import { Pill } from "./ui/Pill";
import { Reveal } from "./ui/Reveal";
import { AudioWaveform } from "./AudioWaveform";
import { otherProject } from "@/lib/content";

export function OtherProjects() {
  return (
    <section className="bg-[#fff8e8] py-20 md:py-28">
      <Container>
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
            Also on the bench
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <div className="glass-shell p-1.5 md:p-2">
            <div className="glass-core overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="order-2 flex flex-col justify-center p-6 md:order-1 md:col-span-7 md:p-10">
                  <p className="font-mono text-[13px] text-fg-faint">
                    {otherProject.date}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-fg">
                    {otherProject.name}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
                    {otherProject.tagline}
                  </p>

                  <div className="mt-6 flex flex-col gap-4">
                    {otherProject.body.map((paragraph, i) => (
                      <p
                        key={i}
                        className="max-w-[62ch] text-[15px] leading-relaxed text-fg-muted"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {otherProject.stack.map((tech) => (
                      <Pill key={tech} tone="warm">{tech}</Pill>
                    ))}
                  </div>
                </div>

                <div className="demo-stage order-1 h-56 border-b border-border bg-bg-raised-2 md:order-2 md:col-span-5 md:h-auto md:border-b-0 md:border-l">
                  <AudioWaveform />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

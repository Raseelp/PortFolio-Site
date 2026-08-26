import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { aboutCopy } from "@/lib/content";

const STAT_COLORS = ["var(--accent-deep)", "var(--accent-gold-deep)", "var(--accent-warm-deep)"];

export function About() {
  return (
    <section id="about" className="bg-[#eefbf6] py-20 md:py-28">
      <Container>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-7 lg:col-span-8">
            <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
              About
            </h2>
            <p className="mt-6 max-w-[62ch] text-[16px] leading-relaxed text-fg-muted md:text-[17px]">
              {aboutCopy.paragraph}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-5 lg:col-span-4">
            <div className="flex flex-col gap-5 border-t border-border pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
              {aboutCopy.stats.map((stat, i) => (
                <div key={stat.label}>
                  <div
                    className="font-mono text-2xl font-medium"
                    style={{ color: STAT_COLORS[i % STAT_COLORS.length] }}
                  >
                    {stat.value}
                  </div>
                  <div className="mt-1 text-[14px] text-fg-muted">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

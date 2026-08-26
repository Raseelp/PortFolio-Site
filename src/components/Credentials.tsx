import { Trophy } from "@phosphor-icons/react/dist/ssr";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { achievement, education } from "@/lib/content";

export function Credentials() {
  return (
    <section className="bg-[#eaf8ff] py-20 md:py-28">
      <Container>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8">
          <Reveal>
            <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] text-fg-faint">
              Education
            </h2>
            <h3 className="mt-4 text-xl font-semibold text-fg">
              {education.degree}
            </h3>
            <p className="mt-1 text-[15px] text-fg-muted">{education.school}</p>
            <p className="mt-3 font-mono text-[13px] text-fg-faint">
              {education.dates} · {education.location}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] text-fg-faint">
              Achievement
            </h2>
            <div className="mt-4 flex items-start gap-3">
              <Trophy size={20} weight="duotone" className="mt-0.5 shrink-0 text-accent-gold-deep" />
              <p className="max-w-[48ch] text-[15px] leading-relaxed text-fg-muted">
                {achievement}
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

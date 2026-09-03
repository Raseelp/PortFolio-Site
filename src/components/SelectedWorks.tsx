import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { projects } from "@/lib/content";
import { PhoneCards } from "./projects/variants/PhoneCards";

export function SelectedWorks() {
  return (
    <section id="work" className="bg-bg py-20 md:py-28">
      <Container>
        <Reveal>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Selected works
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg md:text-4xl">
            What I&apos;ve been building
          </h2>
        </Reveal>

        <div className="mt-14">
          <PhoneCards projects={projects} />
        </div>
      </Container>
    </section>
  );
}

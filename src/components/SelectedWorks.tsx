import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { projects } from "@/lib/content";
import { PhoneCards } from "./projects/variants/PhoneCards";

export function SelectedWorks() {
  return (
    <section id="work" className="py-16 md:py-24">
      <Container>
        <SectionHeading sparks eyebrow="Selected work" lead="What I've been" mark="building" sub="A few things I shipped lately." />

        <div className="mt-12 md:mt-16">
          <PhoneCards projects={projects} />
        </div>
      </Container>
    </section>
  );
}

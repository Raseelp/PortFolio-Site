import { Container } from "./ui/Container";
import { Pill } from "./ui/Pill";
import { Reveal, RevealGroup, RevealItem } from "./ui/Reveal";
import { SearchDemo } from "./SearchDemo";
import { featuredProject } from "@/lib/content";

export function FeaturedProject() {
  return (
    <section id="work" className="bg-[#fff2ee] py-20 md:py-28">
      <Container>
        <Reveal>
          <span className="mb-5 inline-flex items-center rounded-full border border-accent-warm-soft-border bg-white px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-warm-deep">
            Featured project
          </span>
          <h2 className="text-balance max-w-3xl text-3xl font-semibold tracking-tight text-fg md:text-4xl">
            {featuredProject.name}
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-fg-muted md:text-[17px]">
            {featuredProject.tagline}
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {featuredProject.stack.map((tech) => (
              <Pill key={tech} tone="warm">{tech}</Pill>
            ))}
          </div>
        </Reveal>

        {/* Interactive demo: fake natural-language search over placeholder
            photos, visualized live in the 3D embedding space. */}
        <Reveal delay={0.1} className="mt-12">
          <SearchDemo />
        </Reveal>

        {/* Case study: problem, approach, what was built, what was hard */}
        <RevealGroup className="mt-16 divide-y divide-border border-t border-border">
          {featuredProject.sections.map((part) => (
            <RevealItem key={part.heading} className="grid grid-cols-1 gap-4 py-8 md:grid-cols-12 md:gap-8">
              <div className="md:col-span-3">
                <h3 className="text-[15px] font-medium text-fg">{part.heading}</h3>
              </div>
              <div className="md:col-span-9">
                <p className="max-w-[70ch] text-[16px] leading-relaxed text-fg-muted">
                  {part.body}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

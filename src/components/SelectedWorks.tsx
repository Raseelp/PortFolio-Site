import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { FilmFeature } from "./projects/FilmFeature";
import { PosterCard } from "./projects/PosterCard";
import { Reveal } from "./ui/Reveal";
import { projects, type Project } from "@/lib/content";

type FilmProject = Project & { film: NonNullable<Project["film"]> };

function hasFilm(p: Project): p is FilmProject {
  return !!p.film;
}

/**
 * One featured project as a screening (its landscape film plus chapters),
 * then the phone-first projects as two tall cards side by side.
 */
export function SelectedWorks() {
  const featured = projects.find(hasFilm);
  const rest = projects.filter((p) => p !== featured);

  return (
    <section id="work" className="py-16 md:py-24">
      <Container>
        <SectionHeading sparks eyebrow="Selected work" lead="What I've been" mark="building" sub="A few things I shipped lately." />

        {featured && (
          <Reveal className="mt-12 md:mt-16" y={24}>
            <FilmFeature project={featured} />
          </Reveal>
        )}

        {rest.length > 0 && (
          <>
            <Reveal className="mt-14 flex items-center gap-4 md:mt-20">
              <p className="shrink-0 font-mono text-[12.5px] font-medium uppercase tracking-[0.16em] text-accent-deep">More builds</p>
              <span aria-hidden className="h-px flex-1 bg-border-strong" />
            </Reveal>
            <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2 md:gap-8">
              {rest.map((project, i) => (
                <Reveal key={project.name} delay={i * 0.08} y={24} className="h-full">
                  <PosterCard project={project} tone={i % 2 === 0 ? "blue" : "ink"} />
                </Reveal>
              ))}
            </div>
          </>
        )}
      </Container>
    </section>
  );
}

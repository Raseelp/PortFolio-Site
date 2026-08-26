import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { skillGroups } from "@/lib/content";

// One color per group, drawn from the same palette as the embedding
// visualizer's category legend, so the two colorful moments on the page
// read as one system rather than two unrelated decisions.
const GROUP_COLORS = [
  "#8b5cf6", // Languages
  "#12b8a0", // Frameworks & Technologies
  "#22b2e8", // Databases
  "#ffb627", // Tools & Platforms
  "#ff6b4a", // Firebase
];

export function Skills() {
  return (
    <section className="bg-[#f5f1ff] py-20 md:py-28">
      <Container>
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
            Skills
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
          {skillGroups.map((group, i) => {
            const color = GROUP_COLORS[i % GROUP_COLORS.length];
            return (
              <Reveal key={group.label} delay={i * 0.04}>
                <div style={{ ["--group-color" as string]: color }}>
                  <h3 className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] text-fg-faint">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {group.label}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full border border-border bg-white/70 px-3.5 py-1.5 text-[14px] text-fg-muted transition-colors hover:border-[var(--group-color)] hover:bg-white hover:text-fg"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

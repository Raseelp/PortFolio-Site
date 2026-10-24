import { Container } from "./ui/Container";
import { InspectorOverlay } from "./ui/InspectorOverlay";
import { Pixels } from "./ui/Pixels";
import { RevealGroup, RevealItem } from "./ui/Reveal";
import { TechIcon } from "./ui/TechIcon";
import { aboutCopy } from "@/lib/content";
import { TECH_BRAND_COLORS, type TechIconSlug } from "@/lib/techIcons";

// The stack he actually reaches for day to day, shown as a row of app-icon
// style tiles (rounded squares in each brand's color).
const DAILY: TechIconSlug[] = ["flutter", "dart", "kotlin", "firebase", "getx", "git", "android"];

const CARD = "insp-host relative rounded-[1.75rem] bg-white shadow-[var(--shadow-card)] md:rounded-[2rem]";

/**
 * The old hero's paragraph and three stats, re-laid as a bento: one tall
 * white card for the paragraph, two white stat cards, and the "apps built"
 * stat on a blue card (the section's one splash of color).
 */
export function About() {
  const [experience, flutter, apps] = aboutCopy.stats;

  return (
    <section id="about" className="py-10 md:py-16">
      <Container>
        <RevealGroup className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-3">
          <RevealItem className={`${CARD} flex flex-col justify-between p-8 md:col-span-2 md:row-span-3 md:p-12`}>
            <InspectorOverlay label="Intro" />
            <div>
              <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-fg md:text-[2.5rem] md:leading-[1.05]">
                A bit <span className="marker">about me</span>
              </h2>
              <p className="mt-6 max-w-[60ch] text-[16.5px] leading-[1.75] text-fg-muted md:text-[17px]">
                {aboutCopy.paragraph}
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex flex-wrap items-center gap-2" aria-hidden>
                {DAILY.map((slug) => (
                  <span
                    key={slug}
                    className="flex h-11 w-11 items-center justify-center rounded-[14px] shadow-[0_6px_14px_-6px_rgba(15,16,48,0.35)] transition-transform duration-300 ease-[var(--ease-spring)] hover:-translate-y-1.5 hover:rotate-[-6deg] md:h-12 md:w-12"
                    style={{ background: TECH_BRAND_COLORS[slug] }}
                  >
                    <TechIcon slug={slug} size={22} className="text-white" />
                  </span>
                ))}
              </div>
              <p className="text-[15px] font-medium text-fg-muted">What I reach for every day</p>
            </div>
          </RevealItem>

          <RevealItem className={`${CARD} flex flex-col justify-center p-8 md:p-10`}>
            <InspectorOverlay label="Stat" />
            <p className="font-display text-[clamp(2.75rem,5vw,4rem)] font-extrabold leading-none tracking-[-0.04em] text-fg">
              {experience.value}
            </p>
            <p className="mt-3 text-[16px] text-fg-muted">{experience.label}</p>
          </RevealItem>

          <RevealItem className={`${CARD} flex flex-col justify-center p-8 md:p-10`}>
            <InspectorOverlay label="Stat" />
            <p className="font-display text-[clamp(2.75rem,5vw,4rem)] font-extrabold leading-none tracking-[-0.04em] text-fg">
              {flutter.value}
            </p>
            <p className="mt-3 text-[16px] text-fg-muted">{flutter.label}</p>
          </RevealItem>

          <RevealItem className="insp-host accent-panel relative flex flex-col justify-center rounded-[1.75rem] p-8 text-white shadow-[var(--shadow-panel)] md:rounded-[2rem] md:p-10">
            <InspectorOverlay label="Stat" />
            <p className="font-display text-[clamp(2.75rem,5vw,4rem)] font-extrabold leading-none tracking-[-0.04em]">
              {apps.value}
            </p>
            <p className="mt-3 text-[17px] font-semibold">{apps.label}</p>
            <Pixels pattern="corner" cell={18} flip className="-right-20 -top-20 hidden lg:grid" />
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  );
}

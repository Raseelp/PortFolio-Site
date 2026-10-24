import fs from "node:fs";
import path from "node:path";
import { Pixels } from "./ui/Pixels";
import { LocalTime } from "./ui/LocalTime";
import { Button } from "./ui/Button";
import { HeroGlow } from "./HeroGlow";
import { Reveal } from "./ui/Reveal";
import { ResumeTicket } from "./ui/ResumeTicket";
import { heroCopy, profile } from "@/lib/content";

// Read at build time (this is a static page) so the size shown is always
// the real file's, never a hand-typed number that goes stale the next time
// the resume is swapped.
const resumeBytes = fs.statSync(path.join(process.cwd(), "public", "resume.pdf")).size;
const resumeSizeLabel = `${Math.round(resumeBytes / 1024)} KB`;

/**
 * A left-aligned intro (place and live local time, name in ink, title in the brand
 * blue, one muted line, a solid pill and a ringed pill, the résumé) beside
 * the blue game panel on desktop; stacked on small screens, intro first.
 */
export function Hero() {
  return (
    <section id="top" className="px-3 pb-8 pt-24 md:px-6 md:pb-12 md:pt-32">
      <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <Reveal y={18}>
            <LocalTime place={profile.location} />
          </Reveal>

          <Reveal delay={0.06} y={22}>
            <h1 className="mt-6 text-balance font-display text-[clamp(2.6rem,6vw,4.25rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-fg">
              {profile.name}
              <span className="text-accent-grad mt-2 block">{profile.title}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12} y={22}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-fg-muted">{heroCopy.subtext}</p>
          </Reveal>

          <Reveal delay={0.18} y={22} className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="#work">View selected works</Button>
            <Button href="#contact" variant="secondary">
              Contact
            </Button>
          </Reveal>

          <Reveal delay={0.24} y={22} className="mt-6">
            <ResumeTicket href={profile.resume} sizeLabel={resumeSizeLabel} />
          </Reveal>
        </div>

        <Reveal delay={0.1} y={30} className="relative lg:col-span-7">
          <Pixels pattern="corner" cell={18} delay={0.8} className="-left-20 -top-20 hidden lg:grid" />
          <HeroGlow />
        </Reveal>
      </div>
    </section>
  );
}

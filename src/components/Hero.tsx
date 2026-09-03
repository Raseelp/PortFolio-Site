import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { HeroGlow } from "./HeroGlow";
import { heroCopy, aboutCopy, profile } from "@/lib/content";

const STAT_COLORS = ["var(--accent-gold-deep)", "var(--accent-sky-deep)", "var(--accent-deep)"];

export function Hero() {
  return (
    <>
      <HeroGlow />

      <div className="bg-bg pb-20 pt-14 md:pb-28 md:pt-20">
        <Container>
          <div className="max-w-4xl">
            <h1 className="text-balance text-5xl font-extrabold leading-[0.98] tracking-tight text-fg sm:text-6xl lg:text-7xl">
              {profile.name}
            </h1>
            <p className="mt-1 text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-ink">Flutter</span>{" "}
              <span className="text-fg-muted">Developer</span>
            </p>

            <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-fg-muted md:text-lg">
              {heroCopy.subtext}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button href="#work">View selected works</Button>
              <Button href="#contact" variant="secondary" icon={false}>
                Contact
              </Button>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-10 border-t border-border pt-10 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-7 lg:col-span-8">
              <p className="max-w-[62ch] text-[15px] leading-relaxed text-fg-muted md:text-[16px]">
                {aboutCopy.paragraph}
              </p>
            </div>
            <div className="flex flex-col gap-5 md:col-span-5 md:border-l md:border-border md:pl-8 lg:col-span-4">
              {aboutCopy.stats.map((stat, i) => (
                <div key={stat.label}>
                  <div
                    className="font-mono text-2xl font-medium"
                    style={{ color: STAT_COLORS[i % STAT_COLORS.length] }}
                  >
                    {stat.value}
                  </div>
                  <div className="mt-1 text-[14px] text-fg-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}

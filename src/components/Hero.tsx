import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { HeroGlow } from "./HeroGlow";
import { heroCopy } from "@/lib/content";

export function Hero() {
  return (
    <HeroGlow>
      <Container>
        <div className="max-w-4xl">
          <p className="font-mono text-[13px] tracking-tight text-fg-faint">
            Muhammed Raseel P / Flutter Developer
          </p>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.12] tracking-tight text-fg sm:text-5xl lg:text-6xl">
            {heroCopy.headlinePrefix}{" "}
            <span className="gradient-ink">{heroCopy.headlineEmphasis}</span>
            {heroCopy.headlineSuffix}
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-fg-muted md:text-lg">
            {heroCopy.subtext}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href="#work">View projects</Button>
            <Button href="#contact" variant="secondary" icon={false}>
              Contact
            </Button>
          </div>
        </div>
      </Container>
    </HeroGlow>
  );
}

import { EnvelopeSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { profile } from "@/lib/content";

export function Contact() {
  return (
    <section
      id="contact"
      className="py-24 text-white md:py-32"
      style={{
        background:
          "linear-gradient(120deg, #0a7c6b 0%, #c23f1a 55%, #5b21b6 100%)",
      }}
    >
      <Container>
        <Reveal className="max-w-2xl">
          <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            Open to Flutter and mobile engineering roles.
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-white/85 md:text-lg">
            If you are hiring, or just want to talk about on-device ML or
            audio pipelines, my inbox is open.
          </p>

          <div className="mt-9">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 rounded-full bg-white py-3 pl-6 pr-2 text-[15px] font-medium text-[#15171b] transition-transform duration-300 active:scale-[0.98]"
            >
              <span>Email me</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06]">
                <EnvelopeSimple size={16} weight="bold" />
              </span>
            </a>
          </div>
        </Reveal>
      </Container>

      <div className="mt-20 border-t border-white/20">
        <Container className="flex flex-col items-start justify-between gap-6 py-8 md:flex-row md:items-center">
          <p className="text-[14px] text-white/70">
            {profile.name} · {new Date().getFullYear()}
          </p>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-[14px]">
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-2 text-white/85 transition-colors hover:text-white"
            >
              <EnvelopeSimple size={16} />
              {profile.email}
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/85 transition-colors hover:text-white"
            >
              <LinkedinLogo size={16} />
              LinkedIn
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/85 transition-colors hover:text-white"
            >
              <GithubLogo size={16} />
              GitHub
            </a>
          </div>
        </Container>
      </div>
    </section>
  );
}

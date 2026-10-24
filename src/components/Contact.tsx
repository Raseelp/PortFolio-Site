"use client";

import { ArrowUpRight, Heart } from "@phosphor-icons/react";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { FloatBadge } from "./ui/FloatBadge";
import { InspectorOverlay } from "./ui/InspectorOverlay";
import { Reveal } from "./ui/Reveal";
import { profile } from "@/lib/content";
import { playClick } from "@/lib/sound";

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={playClick}
      className="footer-link text-[15px] font-medium text-fg-muted transition-colors hover:text-fg"
    >
      {label}
      <ArrowUpRight size={13} weight="bold" className="footer-link-arrow" />
    </a>
  );
}

/**
 * The closing call to action: a deep-ink panel with a dot grid and two soft
 * color blooms, a big "Got an idea? Let's build it." with the last words in
 * sun yellow, four tilted app-icon tiles floating around it, a yellow email
 * pill and outlined pills for the two profiles. Small print sits under it
 * on the page.
 */
export function Contact() {
  return (
    <section id="contact" className="px-3 pb-24 pt-16 md:px-6 md:pt-24">
      <div className="mx-auto max-w-[1320px]">
        <div className="insp-host relative">
          <InspectorOverlay label="CTA" tagSide="right" />
          <Reveal className="ink-panel relative overflow-hidden rounded-[2rem] px-6 py-20 text-center text-white md:rounded-[2.5rem] md:py-28">
            <FloatBadge
              slug="flutter"
              className="left-[7%] top-12 hidden md:flex"
              delay="0s"
              size={64}
              tilt={-10}
            />
            <FloatBadge
              slug="kotlin"
              className="right-[9%] top-20 hidden md:flex"
              delay="-1.6s"
              tilt={8}
            />
            <FloatBadge
              slug="dart"
              className="bottom-16 left-[13%] hidden md:flex"
              delay="-3.1s"
              size={52}
              tilt={6}
            />
            <FloatBadge
              slug="firebase"
              className="bottom-12 right-[7%] hidden md:flex"
              delay="-4.4s"
              size={60}
              tilt={-7}
            />

            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">
                Say hello
              </p>
              <h2 className="mx-auto mt-5 max-w-4xl text-balance font-display text-[clamp(2.75rem,9vw,6.5rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">
                Got an idea? Let&apos;s{" "}
                <span className="whitespace-nowrap text-accent-gold">
                  build it.
                  <span
                    aria-hidden
                    className="caret ml-2 inline-block h-[0.78em] w-[0.4em] translate-y-[0.04em] rounded-[0.12em] bg-accent-gold"
                  />
                </span>
              </h2>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
                <Button href={`mailto:${profile.email}`} variant="gold">
                  {profile.email}
                </Button>
                <Button href={profile.linkedin} external variant="outline">
                  LinkedIn
                </Button>
                <Button href={profile.github} external variant="outline">
                  GitHub
                </Button>
              </div>
            </div>
          </Reveal>
        </div>

        <Container className="!px-3 md:!px-4">
          <div className="mt-8 flex flex-col items-center justify-between gap-4 text-[13px] text-fg-faint md:flex-row">
            <p className="flex items-center gap-1.5 text-center">
              © {new Date().getFullYear()} · Made with{" "}
              <Heart size={13} weight="fill" className="text-accent" /> by{" "}
              <span className="font-semibold text-fg">{profile.name}</span>
            </p>
            <div className="flex items-center gap-6">
              <a
                href={profile.resume}
                download="Muhammed Raseel P - Resume.pdf"
                onClick={playClick}
                className="footer-link text-[15px] font-medium text-fg-muted transition-colors hover:text-fg"
              >
                Résumé
                <ArrowUpRight
                  size={13}
                  weight="bold"
                  className="footer-link-arrow"
                />
              </a>
              {profile.instagram && (
                <FooterLink href={profile.instagram} label="Instagram" />
              )}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

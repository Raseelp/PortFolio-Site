"use client";

import { ArrowUpRight, Heart } from "@phosphor-icons/react";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { ElasticDivider } from "./ui/ElasticDivider";
import { profile } from "@/lib/content";
import { playClick } from "@/lib/sound";

function FooterLink({
  href,
  label,
  external = true,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={playClick}
      className="footer-link text-[15px] text-fg-muted transition-colors hover:text-fg"
    >
      {label}
      <ArrowUpRight size={13} weight="bold" className="footer-link-arrow" />
    </a>
  );
}

export function Contact() {
  return (
    // Extra bottom padding here (beyond the usual section rhythm) is
    // deliberate: GradualBlur is a fixed 10rem strip pinned to the bottom of
    // the viewport, so at max scroll the last bit of content sits inside its
    // blur zone unless there's more scrollable room below it than that.
    <section id="contact" className="bg-bg pb-44 pt-20 md:pb-56 md:pt-28">
      <Container>
        <ElasticDivider />

        <Reveal className="flex flex-col gap-10 pt-10 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="text-[15px] text-fg-faint">Got a project in mind?</span>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-fg md:text-5xl">
              Let&apos;s Talk
            </h2>
          </div>

          <div className="flex gap-14 md:gap-20">
            <div className="flex flex-col gap-3">
              <FooterLink href={profile.github} label="GitHub" />
              <FooterLink href={`mailto:${profile.email}`} label={profile.email} external={false} />
            </div>
            <div className="flex flex-col gap-3">
              <FooterLink href={profile.linkedin} label="LinkedIn" />
              <FooterLink href={profile.resume} label="Resume" />
              {/* Instagram omitted until a real handle exists — see content.ts */}
              {profile.instagram && <FooterLink href={profile.instagram} label="Instagram" />}
            </div>
          </div>
        </Reveal>

        <p className="mt-16 flex items-center justify-center gap-1.5 text-center text-[13px] text-fg-faint">
          © {new Date().getFullYear()} · Made with <Heart size={13} weight="fill" className="text-accent" /> by{" "}
          <span className="font-semibold text-accent">{profile.name}</span>
        </p>
      </Container>
    </section>
  );
}

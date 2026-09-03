"use client";

import { FileArrowDown } from "@phosphor-icons/react";
import { useReducedMotion } from "motion/react";
import { playClick } from "@/lib/sound";

/**
 * The resume used to be one plain text link buried in the footer link list —
 * easy to miss, and no more visually interesting than "GitHub" or
 * "LinkedIn" next to it. This gives it its own identity right where someone
 * deciding whether to keep reading would actually want it: a dashed-border,
 * monospace tag styled like a ticket stub (something you'd tear off and
 * take with you), sitting slightly askew at rest and straightening on
 * hover — a small bit of the same physicality the rest of the site has
 * (Snake, the tilt cards, the pointer-repel icons), scaled down to a single
 * link. The footer link stays too; this is the one someone actually notices.
 */
export function ResumeTicket({ href, sizeLabel }: { href: string; sizeLabel: string }) {
  const reduce = useReducedMotion();

  return (
    <a
      href={href}
      download="Muhammed Raseel P - Resume.pdf"
      onClick={playClick}
      className={`group mt-6 inline-flex w-fit items-center gap-3 rounded-xl border border-dashed border-border-strong bg-bg-raised/50 py-2 pl-2.5 pr-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/60 ${
        reduce ? "" : "-rotate-2 hover:rotate-0"
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-strong bg-bg text-fg-muted transition-colors duration-300 group-hover:border-accent/50 group-hover:text-accent">
        <FileArrowDown
          size={15}
          weight="bold"
          className="transition-transform duration-300 group-hover:translate-y-0.5"
        />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-mono text-[12.5px] uppercase tracking-[0.06em] text-fg-muted transition-colors duration-300 group-hover:text-accent">
          résumé.pdf
        </span>
        <span className="text-[11px] text-fg-faint">{sizeLabel} · click to download</span>
      </span>
    </a>
  );
}

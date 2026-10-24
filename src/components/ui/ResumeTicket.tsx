"use client";

import { ArrowDown } from "@phosphor-icons/react";
import { playClick } from "@/lib/sound";

/**
 * The résumé as a plain text link under the two hero buttons: a quieter
 * third action, underlined, with the arrow dropping on hover. It downloads
 * (with the person's name as the file name) rather than navigating off to a
 * PDF viewer. The real file size is shown, computed at build time by the
 * caller.
 */
export function ResumeTicket({ href, sizeLabel }: { href: string; sizeLabel: string }) {
  return (
    <a
      href={href}
      download="Muhammed Raseel P - Resume.pdf"
      onClick={playClick}
      className="group inline-flex items-baseline gap-3 text-[15px] font-bold text-fg"
    >
      <span className="inline-flex items-center gap-1.5 border-b-2 border-accent-gold pb-0.5 transition-colors group-hover:border-accent">
        Download résumé
        <ArrowDown size={14} weight="bold" className="transition-transform duration-300 group-hover:translate-y-0.5" />
      </span>
      <span className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-fg-faint">PDF · {sizeLabel}</span>
    </a>
  );
}

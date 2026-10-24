"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { navLinks, profile } from "@/lib/content";
import { handleHashClick } from "@/lib/smoothAnchor";
import { playClick, playHover, playMenuClose, playMenuOpen } from "@/lib/sound";

// The last nav entry is the call to action (the solid button on the right),
// the rest are plain text links.
const LINKS = navLinks.slice(0, -1);
const CTA = navLinks[navLinks.length - 1];
const SECTION_IDS = LINKS.map((l) => l.href.slice(1));

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      onClick={(e) => {
        e.preventDefault();
        playClick();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      aria-label={`${profile.name}, back to top`}
      className={`font-display text-[24px] font-extrabold leading-none tracking-[-0.04em] ${light ? "text-white" : "text-fg"}`}
    >
      <span className={light ? "" : "marker"}>raseel</span>
    </Link>
  );
}

/**
 * A plain, full-width bar rather than floating chips: the wordmark on the
 * left, text links on the right with a small dot that slides to whichever
 * section is on screen (scroll-spy), and one solid Contact button. The bar
 * is the page color with no border until you scroll, then a hairline
 * appears. Below md it collapses to the wordmark and a "Menu" text button
 * that opens a dark full-screen sheet. Solid fills only (no backdrop-filter),
 * so it costs nothing pinned over a scrolling page.
 */
export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: the section whose box covers a band just under the nav is
  // the active one; nothing is active while the hero is on screen.
  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
        const current = SECTION_IDS.find((id) => visible.get(id)) ?? null;
        setActive(current);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
          menuOpen ? "border-transparent bg-transparent" : scrolled ? "border-border bg-bg" : "border-transparent bg-bg"
        }`}
      >
        <nav aria-label="Primary" className="mx-auto flex h-16 w-[calc(100%-1.5rem)] max-w-[1320px] items-center justify-between md:h-[72px] md:w-[calc(100%-3rem)]">
          <Wordmark light={menuOpen} />

          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map((link) => {
              const isActive = active === link.href.slice(1);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    playClick();
                    handleHashClick(e, link.href);
                  }}
                  onMouseEnter={playHover}
                  className={`relative py-2 text-[15px] font-semibold transition-colors ${
                    isActive ? "text-fg" : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      aria-hidden
                      className="absolute -bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                </Link>
              );
            })}
            <Link
              href={CTA.href}
              onClick={(e) => {
                playClick();
                handleHashClick(e, CTA.href);
              }}
              className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-[14px] font-bold text-white transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
            >
              {CTA.label}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              if (menuOpen) playMenuClose();
              else playMenuOpen();
              setMenuOpen(!menuOpen);
            }}
            className={`relative z-50 py-2 text-[15px] font-bold md:hidden ${menuOpen ? "text-white" : "text-fg"}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="ink-panel fixed inset-0 z-40 md:hidden"
          >
            <div className="flex h-full flex-col justify-center gap-1 px-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: reduce ? 0 : 0.07 * i + 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      playClick();
                      setMenuOpen(false);
                      handleHashClick(e, link.href);
                    }}
                    className="block py-2 font-display text-[clamp(2.75rem,13vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-white transition-colors hover:text-accent-gold"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

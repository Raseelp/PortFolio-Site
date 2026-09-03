"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { navLinks } from "@/lib/content";
import { LiquidGlassFilter } from "./ui/LiquidGlassFilter";
import { handleHashClick } from "@/lib/smoothAnchor";
import { playClick, playHover, playMenuClose, playMenuOpen } from "@/lib/sound";

/**
 * Matches the reference site's nav exactly: a centered floating liquid-glass
 * pill of text links on wider screens, collapsing to a single liquid-glass
 * icon button (opening a full-screen menu) below the md breakpoint. Hover
 * physics (scale 1.2, sparkle spins 225deg, active-press scale 0.8) are
 * copied from the reference's own button/circleAnimate recipe.
 */
export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <LiquidGlassFilter />

      {/* Desktop: centered pill of links */}
      <nav className="liquid-glass fixed left-1/2 top-6 z-50 hidden -translate-x-1/2 items-center gap-1 rounded-[26px] px-2 py-2 md:flex">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={(e) => {
              playClick();
              handleHashClick(e, link.href);
            }}
            onMouseEnter={playHover}
            className="group relative isolate inline-flex scale-100 items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-bold text-fg transition-transform duration-300 ease-in-out hover:scale-[1.2] hover:text-accent active:scale-[0.8] active:bg-white/10 active:!duration-100"
          >
            <span className="inline-block rotate-0 text-[11px] text-fg transition-[rotate,color] duration-500 ease-in-out group-hover:rotate-[225deg] group-hover:text-accent">
              ✦
            </span>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile: single icon button opening a full-screen menu */}
      <div className="fixed right-5 top-5 z-50 md:hidden">
        <button
          type="button"
          onClick={() => {
            if (menuOpen) playMenuClose();
            else playMenuOpen();
            setMenuOpen(!menuOpen);
          }}
          className="liquid-glass flex h-11 w-11 items-center justify-center rounded-[22px] text-fg transition-colors hover:text-accent"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={18} /> : <List size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex h-full flex-col items-start justify-center gap-2 px-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: reduce ? 0 : 0.08 * i,
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
                    className="group flex items-center gap-3 text-4xl font-bold tracking-tight text-fg transition-transform duration-500 ease-in-out hover:scale-[1.15] hover:text-accent"
                  >
                    <span className="inline-block rotate-0 text-2xl text-fg transition-[rotate,color] duration-500 ease-in-out group-hover:rotate-[225deg] group-hover:text-accent">
                      ✦
                    </span>
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

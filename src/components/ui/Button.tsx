"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { MouseEvent, PointerEvent, ReactNode } from "react";
import { handleHashClick } from "@/lib/smoothAnchor";
import { playClick } from "@/lib/sound";

interface ButtonProps {
  href: string;
  children: ReactNode;
  /** primary: solid ink with a yellow arrow chip. secondary: white with a
   * ring. light: a white pill for a blue panel. gold: yellow, for dark
   * panels. outline: a ghost pill with a light ring, for dark panels. */
  variant?: "primary" | "secondary" | "light" | "gold" | "outline";
  external?: boolean;
  /** Passed through to the anchor, e.g. a download filename. */
  download?: string;
  onClick?: () => void;
}

const BASE =
  "group inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full text-[15px] font-bold transition-[transform,background-color,box-shadow] duration-300 ease-[var(--ease-out)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]";

const VARIANTS = {
  primary: "bg-ink pl-6 pr-1.5 text-white shadow-[0_8px_20px_-8px_rgba(15,16,48,0.6)] hover:shadow-[0_14px_28px_-8px_rgba(15,16,48,0.6)]",
  secondary: "bg-white px-6 text-fg ring-1 ring-ink/10 hover:bg-bg-raised-2",
  light: "bg-white px-6 text-ink shadow-[0_8px_20px_-10px_rgba(10,20,120,0.6)] hover:shadow-[0_14px_28px_-10px_rgba(10,20,120,0.6)]",
  gold: "bg-accent-gold px-6 text-ink hover:brightness-105",
  outline: "px-6 text-white ring-1 ring-white/30 hover:bg-white/10",
};

export function Button({ href, children, variant = "primary", external = false, download, onClick }: ButtonProps) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const reduce = useReducedMotion();
  // A small magnetic lean toward the cursor, on the primary pill only.
  const magnetic = variant === "primary" && !reduce;

  function handlePointerMove(e: PointerEvent<HTMLElement>) {
    if (!magnetic) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    mx.set(Math.max(-6, Math.min(6, relX * 0.22)));
    my.set(Math.max(-4, Math.min(4, relY * 0.3)));
  }

  function handlePointerLeave() {
    mx.set(0);
    my.set(0);
  }

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    playClick();
    handleHashClick(e, href);
    onClick?.();
  }

  const content = (
    <motion.span
      style={magnetic ? { x: mx, y: my } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className="inline-flex items-center gap-3"
    >
      {children}
      {variant === "primary" && (
        <span
          aria-hidden
          className="arrow-chip flex h-9 w-9 items-center justify-center rounded-full bg-accent-gold text-ink"
        >
          <ArrowUpRight size={16} weight="bold" />
        </span>
      )}
    </motion.span>
  );

  const className = `${BASE} ${VARIANTS[variant]}`;

  if (external || download) {
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        download={download}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={className}
    >
      {content}
    </Link>
  );
}

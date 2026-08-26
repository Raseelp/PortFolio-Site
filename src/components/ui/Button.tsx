"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { PointerEvent, ReactNode } from "react";

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
  icon?: boolean;
  onClick?: () => void;
}

export function Button({
  href,
  children,
  variant = "primary",
  external = false,
  icon = true,
  onClick,
}: ButtonProps) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const reduce = useReducedMotion();
  const magnetic = variant === "primary" && !reduce;

  const base =
    "group inline-flex items-center gap-2 rounded-full pl-6 pr-2 py-2 text-[15px] font-medium transition-colors duration-300 active:scale-[0.98] whitespace-nowrap";

  const variants = {
    primary:
      "bg-accent-warm text-[#1a0a05] hover:bg-accent-warm-deep hover:text-white shadow-[0_0_0_1px_rgba(255,107,74,0.4)]",
    secondary:
      "bg-bg text-fg border border-border-strong hover:bg-black/[0.04] pr-6",
  };

  function handlePointerMove(e: PointerEvent<HTMLElement>) {
    if (!magnetic) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    mx.set(Math.max(-7, Math.min(7, relX * 0.25)));
    my.set(Math.max(-6, Math.min(6, relY * 0.35)));
  }

  function handlePointerLeave() {
    mx.set(0);
    my.set(0);
  }

  const content = (
    <motion.span
      style={magnetic ? { x: mx, y: my } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className="inline-flex items-center gap-2"
    >
      <span>{children}</span>
      {icon && variant === "primary" && (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight size={16} weight="bold" />
        </span>
      )}
    </motion.span>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={`${base} ${variants[variant]}`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`${base} ${variants[variant]}`}
    >
      {content}
    </Link>
  );
}

const TONES = {
  neutral: "border-border-strong bg-bg-raised text-fg-muted",
  warm: "border-accent-warm-soft-border bg-accent-warm-soft text-accent-warm-deep",
  accent: "border-accent-soft-border bg-accent-soft text-accent-deep",
} as const;

export function Pill({
  children,
  tone = "neutral",
}: {
  children: string;
  tone?: keyof typeof TONES;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3.5 py-1.5 font-mono text-[12px] tracking-tight ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

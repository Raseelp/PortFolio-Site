"use client";

import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

/**
 * "Calicut, Kerala · 9:42 PM IST": the place plus the actual local time
 * there, ticking. Empty on the server and the first client render (so the
 * markup matches), then filled in once mounted; refreshed every 20s, which
 * is plenty for a minute-resolution clock.
 */
export function LocalTime({ place }: { place: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(formatter.format(new Date()).toUpperCase());
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="flex items-center gap-2.5 font-mono text-[12.5px] font-medium uppercase tracking-[0.14em] text-fg-muted">
      <span aria-hidden className="dot-pulse h-1.5 w-1.5 rounded-full bg-accent" />
      <span>{place}</span>
      <span aria-hidden className="text-fg-faint">
        /
      </span>
      <span className="min-w-[8ch] tabular-nums" suppressHydrationWarning>
        {time ? `${time} IST` : ""}
      </span>
    </p>
  );
}

import { TechIcon } from "./TechIcon";
import { TECH_BRAND_COLORS, type TechIconSlug } from "@/lib/techIcons";

/**
 * An app-icon style tile (rounded square in the brand's own color, white
 * glyph) bobbing gently and tilted a few degrees (the `float-y` keyframe is
 * transform-only and reads `--r` for the tilt). Pure decoration, so hidden
 * from assistive tech. Position it with `className` (absolute offsets);
 * stagger several with different `delay`s so they don't bob in lockstep.
 */
export function FloatBadge({
  slug,
  className = "",
  delay = "0s",
  size = 56,
  tilt = -8,
}: {
  slug: TechIconSlug;
  className?: string;
  delay?: string;
  size?: number;
  tilt?: number;
}) {
  return (
    <span
      aria-hidden
      className={`float-y absolute flex items-center justify-center shadow-[0_14px_28px_-10px_rgba(10,15,80,0.55)] ring-2 ring-white/70 ${className}`}
      style={
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          background: TECH_BRAND_COLORS[slug],
          animationDelay: delay,
          "--r": `${tilt}deg`,
        } as React.CSSProperties
      }
    >
      <TechIcon slug={slug} size={Math.round(size * 0.48)} className="text-white" />
    </span>
  );
}

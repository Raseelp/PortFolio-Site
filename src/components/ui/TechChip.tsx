import { TechIcon } from "./TechIcon";
import { TECH_LABEL_ICONS, TECH_BRAND_COLORS, type TechIconSlug } from "@/lib/techIcons";

/**
 * Logo badge + label, matching the reference site's tech marks: each icon
 * sits in a small rounded square filled with its own real brand color, not
 * a monochrome icon set. Labels with no verified icon (Provider, Gin, REST
 * APIs, individual Firebase products) render as text only.
 */
export function TechChip({ label, size = "sm" }: { label: string; size?: "sm" | "lg" }) {
  const slugs = TECH_LABEL_ICONS[label];
  const list = Array.isArray(slugs) ? slugs : slugs ? [slugs] : [];
  const primary = list[0] as TechIconSlug | undefined;
  const badgeColor = primary ? TECH_BRAND_COLORS[primary] : undefined;
  const lg = size === "lg";

  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap ${lg ? "gap-3 px-4" : "gap-2 rounded-full border border-border-strong bg-bg-raised py-1.5 pl-1.5 pr-3.5"}`}
    >
      {list.length > 0 && (
        <span
          className={
            lg
              ? "flex h-9 w-9 items-center justify-center rounded-[10px]"
              : "flex h-6 w-6 items-center justify-center rounded-full"
          }
          style={{ background: badgeColor ?? "var(--bg-raised-2)" }}
        >
          {list.map((slug) => (
            <TechIcon key={slug} slug={slug} size={lg ? 18 : 13} className="text-white" />
          ))}
        </span>
      )}
      <span
        className={lg ? "text-[22px] font-semibold tracking-tight text-fg-muted" : "text-[13px] font-medium text-fg-muted"}
      >
        {label}
      </span>
    </span>
  );
}

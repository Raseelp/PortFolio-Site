import { FolderOpen } from "@phosphor-icons/react/dist/ssr";
import { RevealGroup, RevealItem } from "../../ui/Reveal";
import { TechIcon } from "../../ui/TechIcon";
import { skillGroups } from "@/lib/content";
import { TECH_LABEL_ICONS, TECH_BRAND_COLORS, type TechIconSlug } from "@/lib/techIcons";

/** Variant 2 — a file-explorer / `tree` command layout: each category is a folder, each skill a file. */
export function BrowseTree() {
  return (
    <RevealGroup className="mt-14 flex flex-col gap-6 font-mono text-[14px]">
      {skillGroups.map((group) => (
        <RevealItem key={group.label}>
          <div className="flex items-center gap-2 text-fg">
            <FolderOpen size={16} weight="bold" className="text-accent" />
            <span className="font-semibold">{group.label}</span>
            <span className="text-fg-faint">/</span>
          </div>
          <div className="mt-1 border-l border-border pl-4">
            {group.items.map((item, i) => {
              const isLast = i === group.items.length - 1;
              const slugs = TECH_LABEL_ICONS[item];
              const slug = (Array.isArray(slugs) ? slugs[0] : slugs) as TechIconSlug | undefined;
              const color = slug ? TECH_BRAND_COLORS[slug] : undefined;
              return (
                <div key={item} className="flex items-center gap-2 py-1 text-fg-muted">
                  <span className="text-fg-faint">{isLast ? "└──" : "├──"}</span>
                  {slug && (
                    <span style={{ color: color ?? "var(--fg-muted)" }}>
                      <TechIcon slug={slug} size={13} />
                    </span>
                  )}
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

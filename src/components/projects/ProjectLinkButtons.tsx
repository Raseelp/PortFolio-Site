import { GithubLogo, Play } from "@phosphor-icons/react/dist/ssr";

/**
 * Placeholder GitHub/demo pills — visual only, not wired to anything yet
 * (no real repo or hosted-demo link exists for these projects). Styled to
 * sit quietly rather than invite a click: no hover state, default cursor.
 */
export function ProjectLinkButtons({ className }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <span className="inline-flex cursor-default items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-[12px] font-medium text-fg-muted">
        <GithubLogo size={13} />
        GitHub
      </span>
      <span className="inline-flex cursor-default items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-[12px] font-medium text-fg-muted">
        <Play size={12} weight="fill" />
        Demo
      </span>
    </div>
  );
}

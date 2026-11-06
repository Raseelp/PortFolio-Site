import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

const LINK = "inline-flex items-center gap-1 text-[13.5px] font-semibold";

/**
 * The project's links as plain text with an arrow. Just GitHub for now (a
 * muted, inert label when a project has no public repo); a Play Store link
 * goes here once an app is released.
 */
export function ProjectLinkButtons({ repo, className }: { repo?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-5 ${className ?? ""}`}>
      {repo ? (
        <a
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
          className={`${LINK} text-fg underline decoration-accent-gold decoration-2 underline-offset-4 transition-colors duration-300 hover:text-accent-deep`}
        >
          GitHub
          <ArrowUpRight size={13} weight="bold" />
        </a>
      ) : (
        <span className={`${LINK} cursor-default text-fg-faint`}>
          GitHub
          <ArrowUpRight size={13} weight="bold" />
        </span>
      )}
    </div>
  );
}

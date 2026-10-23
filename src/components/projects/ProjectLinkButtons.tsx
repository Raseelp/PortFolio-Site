import { GithubLogo, Play } from "@phosphor-icons/react/dist/ssr";

const PILL =
  "inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-[12px] font-medium text-fg-muted";

/**
 * GitHub/demo pills. GitHub links to the project's repo when it has one;
 * the demo pill stays a quiet placeholder (no hosted demo exists yet), with
 * no hover state and a default cursor so it doesn't invite a click.
 */
export function ProjectLinkButtons({ repo, className }: { repo?: string; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      {repo ? (
        <a
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
          className={`${PILL} transition-colors duration-300 hover:border-accent/60 hover:text-accent`}
        >
          <GithubLogo size={13} />
          GitHub
        </a>
      ) : (
        <span className={`${PILL} cursor-default`}>
          <GithubLogo size={13} />
          GitHub
        </span>
      )}
      <span className={`${PILL} cursor-default`}>
        <Play size={12} weight="fill" />
        Demo
      </span>
    </div>
  );
}

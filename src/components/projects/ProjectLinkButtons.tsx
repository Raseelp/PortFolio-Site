import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

const LINK = "inline-flex items-center gap-1 text-[13.5px] font-semibold";

/**
 * GitHub and Demo as plain text links with an arrow. GitHub links to the
 * project's repo when it has one; the Demo stays a quiet placeholder (no
 * hosted demo exists yet), muted, with no hover state and a default cursor
 * so it doesn't invite a click.
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
      <span className={`${LINK} cursor-default text-fg-faint`}>
        Demo
        <ArrowUpRight size={13} weight="bold" />
      </span>
    </div>
  );
}

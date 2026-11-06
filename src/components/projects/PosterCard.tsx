import { FloatBadge } from "../ui/FloatBadge";
import { InspectorOverlay } from "../ui/InspectorOverlay";
import { ProjectLinkButtons } from "./ProjectLinkButtons";
import { ProjectMedia } from "./ProjectMedia";
import { ProjectDate, StackList, StatList, slugsFor } from "./ProjectParts";
import { TiltCard } from "./variants/TiltCard";
import type { Project } from "@/lib/content";

/**
 * A phone-first project as a tall card: a colored bay on top holding the
 * phone (with two app-icon tiles beside it), the write-up underneath. Two sit
 * side by side under the featured film.
 */
export function PosterCard({ project, tone }: { project: Project; tone: "blue" | "ink" }) {
  const badges = Array.from(new Set(project.stack.flatMap(slugsFor))).slice(0, 2);

  return (
    <div className="insp-host relative h-full">
      <InspectorOverlay label="Card" />
      <TiltCard className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white p-3 shadow-[var(--shadow-card)] transition-shadow duration-500 hover:shadow-[var(--shadow-card-hover)] md:rounded-[2rem]">
        <div
          className={`${tone === "blue" ? "accent-panel" : "ink-panel"} relative flex items-center justify-center overflow-hidden rounded-[1.25rem] px-6 py-10 md:rounded-[1.5rem]`}
        >
          {badges[0] && <FloatBadge slug={badges[0]} className="left-5 top-5" delay="0s" tilt={-10} />}
          {badges[1] && <FloatBadge slug={badges[1]} className="bottom-6 right-5" delay="-2.2s" tilt={9} />}
          <div className="w-[176px] rounded-[2.2rem] border-[6px] border-[#151517] bg-[#151517] p-1.5 shadow-[0_30px_50px_-18px_rgba(10,15,100,0.65)] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-2">
            <div className="relative">
              <span aria-hidden className="absolute left-1/2 top-2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-[#151517]" />
              <ProjectMedia videoUrl={project.previewVideo} className="aspect-[9/19] rounded-[1.7rem]" />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-6 md:pt-7">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <ProjectDate>{project.date}</ProjectDate>
            <ProjectLinkButtons repo={project.repo} />
          </div>
          <h3 className="font-display text-[1.75rem] font-bold leading-[1.08] tracking-[-0.03em] text-fg md:text-[2rem]">
            {project.name}
          </h3>
          <p className="text-[16px] font-medium leading-snug text-fg">{project.tagline}</p>
          <p className="text-[14.5px] leading-relaxed text-fg-muted">{project.description}</p>
          <StatList stats={project.stats} />
          <div className="mt-auto pt-1">
            <StackList stack={project.stack} />
          </div>
        </div>
      </TiltCard>
    </div>
  );
}

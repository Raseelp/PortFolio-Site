"use client";

import { useRef, useState } from "react";
import { InspectorOverlay } from "../ui/InspectorOverlay";
import { FilmScreen, clock, type FilmData, type FilmHandle } from "./FilmScreen";
import { ProjectLinkButtons } from "./ProjectLinkButtons";
import { AppIcon, ProjectDate, StackList, StatList } from "./ProjectParts";
import { playClick } from "@/lib/sound";
import type { Project } from "@/lib/content";

/**
 * The featured project as a screening: the landscape product film sits on a
 * blue stage beside a chapter list (click one to jump there), and the
 * write-up runs underneath like programme notes. On a phone the chapters
 * become a row of chips under the film. Playback rules are in FilmScreen.
 */
export function FilmFeature({ project }: { project: Project & { film: FilmData } }) {
  const { film } = project;
  const screen = useRef<FilmHandle>(null);
  const [time, setTime] = useState(0);
  const total = film.duration;
  const chapters = film.chapters ?? [];
  const activeIndex = chapters.reduce((found, c, i) => (time >= c.start ? i : found), 0);

  return (
    <div className="insp-host relative">
      <InspectorOverlay label="Screening" tagSide="right" />
      <article className="overflow-hidden rounded-[1.75rem] bg-white shadow-[var(--shadow-card)] md:rounded-[2rem]">
        {/* The stage: film on the left, chapters on the right */}
        <div className="accent-panel p-3 md:p-6 lg:p-8">
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-8">
              <FilmScreen ref={screen} film={film} label={`${project.name} product film`} onTime={setTime} />
            </div>

            <aside className="min-w-0 lg:col-span-4">
              <p className="mb-3 hidden font-mono text-[11.5px] font-medium uppercase tracking-[0.16em] text-white/85 lg:block">
                Chapters · {chapters.length}
              </p>
              <ol className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
                {chapters.map((c, i) => {
                  const end = chapters[i + 1]?.start ?? total;
                  const on = i === activeIndex;
                  const progress = on ? Math.min(1, Math.max(0, (time - c.start) / (end - c.start))) : 0;
                  return (
                    <li key={c.start} className="shrink-0 lg:shrink">
                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          screen.current?.seek(c.start);
                        }}
                        aria-current={on ? "true" : undefined}
                        className={`relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3.5 py-2.5 text-left transition-colors ${
                          on ? "bg-white text-ink" : "text-white/90 hover:bg-white/15"
                        }`}
                      >
                        <span className={`w-9 shrink-0 font-mono text-[11.5px] tabular-nums ${on ? "text-accent-deep" : "text-white/85"}`}>
                          {clock(c.start)}
                        </span>
                        <span className="whitespace-nowrap text-[14px] font-semibold lg:whitespace-normal">{c.label}</span>
                        {on && (
                          <span
                            aria-hidden
                            className="absolute bottom-0 left-0 h-[3px] bg-accent-gold"
                            style={{ width: `${progress * 100}%` }}
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </aside>
          </div>
        </div>

        {/* Programme notes */}
        <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-12 lg:gap-12 lg:p-12">
          <div className="lg:col-span-5">
            <ProjectDate>{project.date}</ProjectDate>
            <div className="group/title mt-5 flex items-center gap-3.5 md:gap-4">
              {project.icon && <AppIcon src={project.icon} />}
              <div className="min-w-0">
                <h3 className="font-display text-[2rem] font-extrabold leading-[1.02] tracking-[-0.035em] text-fg md:text-[2.75rem]">
                  {project.name}
                </h3>
                {project.tags && (
                  <p className="mt-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-fg-faint md:text-[11.5px]">
                    {project.tags.join(" · ")}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-4 max-w-[34ch] text-[18px] font-medium leading-snug text-fg">{project.tagline}</p>
            <ProjectLinkButtons repo={project.repo} className="mt-6" />
          </div>
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
            <p className="max-w-[62ch] text-[15px] leading-relaxed text-fg-muted">{project.description}</p>
            <StatList stats={project.stats} columns={2} />
            <StackList stack={project.stack} />
          </div>
        </div>
      </article>
    </div>
  );
}

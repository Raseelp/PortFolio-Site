"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Pause, Play, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { InspectorOverlay } from "../ui/InspectorOverlay";
import { ProjectLinkButtons } from "./ProjectLinkButtons";
import { ProjectDate, StackList, StatList } from "./ProjectParts";
import { playClick } from "@/lib/sound";
import type { Project } from "@/lib/content";

type Film = NonNullable<Project["film"]>;

function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * The featured project as a screening: the landscape product film sits on a
 * blue stage beside a chapter list (click one to jump there), and the
 * write-up runs underneath like programme notes. On a phone the chapters
 * become a row of chips under the film.
 *
 * The video file is only requested once the stage is within about 600px of
 * the screen, plays muted while at least half of it is visible and pauses
 * when it leaves. It does not autoplay under reduced motion or Data Saver;
 * the poster and a play button are shown instead. Sound is the visitor's
 * choice.
 */
export function FilmFeature({ project }: { project: Project & { film: Film } }) {
  const { film } = project;
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(film.duration);
  const [failed, setFailed] = useState(false);

  const attach = useCallback(() => {
    const v = videoRef.current;
    if (!v || v.getAttribute("src")) return;
    v.src = film.src;
    v.load();
  }, [film.src]);

  useEffect(() => {
    const stage = stageRef.current;
    const v = videoRef.current;
    if (!stage || !v) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const autoplay = !reduce && !saveData;

    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && autoplay) attach();
      },
      { rootMargin: "600px 0px" },
    );
    const visible = new IntersectionObserver(
      ([entry]) => {
        // Leaving the screen always pauses (a film the visitor started with
        // sound must not keep talking off-screen); only autoplay mode resumes it.
        if (!entry.isIntersecting) v.pause();
        else if (autoplay && !userPaused.current) v.play().catch(() => {});
      },
      { threshold: 0.5 },
    );
    near.observe(stage);
    visible.observe(stage);
    return () => {
      near.disconnect();
      visible.disconnect();
      v.pause();
    };
  }, [attach, reduce]);

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    playClick();
    attach();
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
    }
  }

  function seek(to: number) {
    const v = videoRef.current;
    if (!v) return;
    attach();
    v.currentTime = to;
    setTime(to);
    userPaused.current = false;
    v.play().catch(() => {});
  }

  function toggleSound() {
    const v = videoRef.current;
    if (!v) return;
    playClick();
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  const total = duration || film.duration;
  const activeIndex = film.chapters.reduce((found, c, i) => (time >= c.start ? i : found), 0);

  return (
    <div className="insp-host relative">
      <InspectorOverlay label="Screening" tagSide="right" />
      <article className="overflow-hidden rounded-[1.75rem] bg-white shadow-[var(--shadow-card)] md:rounded-[2rem]">
        {/* The stage: film on the left, chapters on the right */}
        <div className="accent-panel p-3 md:p-6 lg:p-8">
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
            <div ref={stageRef} className="lg:col-span-8">
              <div className="relative aspect-video overflow-hidden rounded-[1.1rem] bg-[#e9f0ec] shadow-[0_24px_50px_-20px_rgba(10,15,100,0.7)] md:rounded-[1.4rem]">
                <video
                  ref={videoRef}
                  poster={film.poster}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-label={`${project.name} product film`}
                  className="h-full w-full object-cover"
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  onError={() => {
                    if (videoRef.current?.getAttribute("src")) setFailed(true);
                  }}
                  onClick={toggle}
                />

                {failed && (
                  <p className="absolute inset-x-4 top-4 rounded-lg bg-white/90 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-fg-muted">
                    The film could not load. Try reloading the page.
                  </p>
                )}

                {!playing && !failed && (
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label="Play the film"
                    className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent-gold text-ink shadow-[0_12px_30px_-8px_rgba(10,15,100,0.6)] transition-transform duration-300 ease-[var(--ease-spring)] hover:scale-110 md:h-20 md:w-20"
                  >
                    <Play size={28} weight="fill" />
                  </button>
                )}

                {/* Controls */}
                <div className="absolute inset-x-2 bottom-2 flex items-center gap-2.5 rounded-full bg-ink/90 p-1.5 pr-3 text-white md:inset-x-3 md:bottom-3 md:gap-3">
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={playing ? "Pause" : "Play"}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-gold text-ink md:h-9 md:w-9"
                  >
                    {playing ? <Pause size={15} weight="fill" /> : <Play size={15} weight="fill" />}
                  </button>
                  <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-white/90">
                    {clock(time)}
                    <span className="hidden sm:inline"> / {clock(total)}</span>
                  </span>
                  <div className="relative flex-1">
                    <input
                      type="range"
                      min={0}
                      max={total}
                      step={0.1}
                      value={Math.min(time, total)}
                      aria-label="Seek"
                      className="film-range"
                      style={{ "--p": `${(Math.min(time, total) / total) * 100}%` } as React.CSSProperties}
                      onChange={(e) => {
                        const v = videoRef.current;
                        attach();
                        const next = Number(e.target.value);
                        if (v) v.currentTime = next;
                        setTime(next);
                      }}
                    />
                    {film.chapters.slice(1).map((c) => (
                      <span
                        key={c.start}
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 rounded-full bg-ink/70"
                        style={{ left: `${(c.start / total) * 100}%` }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={toggleSound}
                    aria-label={muted ? "Turn sound on" : "Mute"}
                    aria-pressed={!muted}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ring-1 ring-white/30 hover:bg-white/10 md:h-9 md:w-9"
                  >
                    {muted ? <SpeakerSlash size={16} weight="bold" /> : <SpeakerHigh size={16} weight="bold" />}
                  </button>
                </div>
              </div>
            </div>

            <aside className="min-w-0 lg:col-span-4">
              <p className="mb-3 hidden font-mono text-[11.5px] font-medium uppercase tracking-[0.16em] text-white/85 lg:block">
                Chapters · {film.chapters.length}
              </p>
              <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
                {film.chapters.map((c, i) => {
                  const end = film.chapters[i + 1]?.start ?? total;
                  const on = i === activeIndex;
                  const progress = on ? Math.min(1, Math.max(0, (time - c.start) / (end - c.start))) : 0;
                  return (
                    <li key={c.start} className="shrink-0 lg:shrink">
                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          seek(c.start);
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
            <h3 className="mt-5 font-display text-[2.25rem] font-extrabold leading-[1.02] tracking-[-0.035em] text-fg md:text-[3.25rem]">
              {project.name}
            </h3>
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

"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowsInSimple, ArrowsOutSimple, Pause, Play, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { FilmLightbox } from "./FilmLightbox";
import { playClick } from "@/lib/sound";
import type { Project } from "@/lib/content";

export type FilmData = NonNullable<Project["film"]>;

export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** What a parent can ask of a film screen. */
export type FilmHandle = { seek: (to: number) => void };

/**
 * One product film: the 16:9 screen with poster, a big play button while
 * paused, and a control bar (play/pause, time, a seek track with a tick at
 * each chapter start when the film has chapters, and a sound button).
 *
 * The video file is only requested once the screen is within about 600px of
 * the viewport; it plays muted while at least half of it is visible and
 * pauses the moment it leaves. It does not autoplay under reduced motion or
 * Data Saver (the poster and a play button show instead). Sound is the
 * visitor's choice. `onTime` reports the playhead; the `ref` handle lets a
 * parent (the chapter list) jump to a time.
 *
 * A small expand button in the control bar pops the film out into a
 * lightbox (see FilmLightbox). The lightbox renders this same component with
 * `expanded`, which starts playing at `startAt` right away and swaps the
 * expand button for a collapse one that calls `onCollapse` with the playhead.
 */
export function FilmScreen({
  film,
  label,
  onTime,
  ref,
  expanded = false,
  startAt = 0,
  startMuted = true,
  onCollapse,
}: {
  film: FilmData;
  label: string;
  onTime?: (seconds: number) => void;
  ref?: Ref<FilmHandle>;
  expanded?: boolean;
  startAt?: number;
  startMuted?: boolean;
  onCollapse?: (seconds: number) => void;
}) {
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(expanded ? startMuted : true);
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

  // The pop-out copy starts at once, from the card's second, with the card's
  // sound setting.
  useEffect(() => {
    if (!expanded) return;
    const v = videoRef.current;
    if (!v) return;
    attach();
    v.muted = startMuted;
    v.currentTime = startAt;
    v.play().catch(() => {});
  }, [expanded, attach, startAt, startMuted]);

  // Keyboard shortcuts in the pop-out: M mutes and unmutes, the left and right
  // arrows seek five seconds. preventDefault also stops a focused seek bar
  // from taking the arrow keys itself in tiny steps.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const v = videoRef.current;
      if (!v) return;
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        playClick();
        v.muted = !v.muted;
        setMuted(v.muted);
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const end = v.duration || film.duration;
        const next = Math.min(end, Math.max(0, v.currentTime + (e.key === "ArrowRight" ? 5 : -5)));
        v.currentTime = next;
        setTime(next);
        onTime?.(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, film.duration, onTime]);

  // The lightbox mounts into <body>, set once the page has hydrated.
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (expanded) return;
    const id = setTimeout(() => setPortalRoot(document.body), 0);
    return () => clearTimeout(id);
  }, [expanded]);

  const [popped, setPopped] = useState<{ left: number; top: number; width: number; time: number; muted: boolean } | null>(null);

  function expand() {
    const v = videoRef.current;
    const stage = stageRef.current;
    if (!v || !stage) return;
    playClick();
    const r = stage.getBoundingClientRect();
    userPaused.current = true;
    v.pause();
    setPopped({ left: r.left, top: r.top, width: r.width, time: v.currentTime, muted: v.muted });
  }

  function collapse(at: number) {
    setPopped(null);
    const v = videoRef.current;
    if (!v) return;
    attach();
    v.currentTime = at;
    setTime(at);
    onTime?.(at);
    userPaused.current = false;
    v.play().catch(() => {});
  }

  function update(next: number) {
    setTime(next);
    onTime?.(next);
  }

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

  useImperativeHandle(ref, () => ({
    seek(to: number) {
      const v = videoRef.current;
      if (!v) return;
      attach();
      v.currentTime = to;
      setTime(to);
      onTime?.(to);
      userPaused.current = false;
      v.play().catch(() => {});
    },
  }));

  function scrub(to: number) {
    const v = videoRef.current;
    attach();
    if (v) v.currentTime = to;
    update(to);
  }

  function toggleSound() {
    const v = videoRef.current;
    if (!v) return;
    playClick();
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  const total = duration || film.duration;

  return (
    <div
      ref={stageRef}
      className="relative aspect-video w-full overflow-hidden rounded-[1.1rem] bg-[#e9f0ec] shadow-[0_24px_50px_-20px_rgba(10,15,100,0.7)] md:rounded-[1.4rem]"
    >
      <video
        ref={videoRef}
        poster={film.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        className="h-full w-full object-cover"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => update(e.currentTarget.currentTime)}
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

      <div className="absolute inset-x-2 bottom-2 flex items-center gap-2.5 rounded-full bg-ink/90 p-1.5 pr-3 text-white md:inset-x-3 md:bottom-3 md:gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-gold text-ink md:h-10 md:w-10"
        >
          {playing ? <Pause size={15} weight="fill" /> : <Play size={15} weight="fill" />}
        </button>
        <span className="hidden shrink-0 font-mono text-[11.5px] tabular-nums text-white/90 sm:inline">
          {clock(time)}
          <span> / {clock(total)}</span>
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
            onChange={(e) => scrub(Number(e.target.value))}
          />
          {(film.chapters ?? []).slice(1).map((ch) => (
            <span
              key={ch.start}
              aria-hidden
              className="pointer-events-none absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 rounded-full bg-ink/70"
              style={{ left: `${(ch.start / total) * 100}%` }}
            />
          ))}
        </div>
        {expanded ? (
          <button
            type="button"
            onClick={() => onCollapse?.(videoRef.current?.currentTime ?? time)}
            aria-label="Close the pop-out"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ring-1 ring-white/30 hover:bg-white/10 md:h-10 md:w-10"
          >
            <ArrowsInSimple size={16} weight="bold" />
          </button>
        ) : (
          <button
            type="button"
            onClick={expand}
            aria-label="Expand the film"
            aria-haspopup="dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ring-1 ring-white/30 hover:bg-white/10 md:h-10 md:w-10"
          >
            <ArrowsOutSimple size={16} weight="bold" />
          </button>
        )}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? "Turn sound on" : "Mute"}
          aria-pressed={!muted}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ring-1 ring-white/30 hover:bg-white/10 md:h-10 md:w-10"
        >
          {muted ? <SpeakerSlash size={16} weight="bold" /> : <SpeakerHigh size={16} weight="bold" />}
        </button>
      </div>

      {portalRoot &&
        createPortal(
          <AnimatePresence>
            {popped && (
              <FilmLightbox
                key="lightbox"
                film={film}
                label={label}
                origin={popped}
                startAt={popped.time}
                startMuted={popped.muted}
                onClose={collapse}
              />
            )}
          </AnimatePresence>,
          portalRoot,
        )}
    </div>
  );
}

/**
 * A project's film on a colored bay at card size: the same screen on a
 * stage the height of a phone bay, so a film card and a phone card in the
 * same row line up. No chapters; the lighter-weight sibling of FilmFeature.
 */
export function FilmBay({ project, tone }: { project: Project & { film: FilmData }; tone: "blue" | "ink" }) {
  return (
    <div
      className={`${tone === "blue" ? "accent-panel" : "ink-panel"} relative flex items-center justify-center overflow-hidden rounded-[1.25rem] p-3 md:h-[26.5rem] md:rounded-[1.5rem] md:p-5`}
    >
      <FilmScreen film={project.film} label={`${project.name} product film`} />
    </div>
  );
}

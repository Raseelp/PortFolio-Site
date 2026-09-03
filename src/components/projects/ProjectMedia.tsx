/**
 * Stand-in for the real demo footage each project will eventually carry —
 * free-licensed stock video (Pexels) chosen to evoke the project, not the
 * actual app, so it's labeled plainly rather than passed off as real
 * product footage. Swap `previewVideo` for a real screen recording per
 * project later; nothing else here needs to change.
 */
export function ProjectMedia({ videoUrl, className }: { videoUrl: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-bg-raised ${className ?? ""}`}>
      <video
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent" />
      {/* Width-constrained and allowed to wrap — the phone frame this sits
          in is a fixed ~190px at every viewport, too narrow for this whole
          phrase on one nowrap line (it was clipping at both edges). */}
      <span className="absolute inset-x-2 bottom-2.5 mx-auto w-fit max-w-[88%] rounded-xl bg-bg/70 px-2.5 py-1 text-center font-mono text-[9px] uppercase leading-snug tracking-[0.08em] text-fg-faint backdrop-blur-sm">
        Placeholder footage · real demo coming soon
      </span>
    </div>
  );
}

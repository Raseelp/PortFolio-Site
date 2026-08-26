const BAR_COUNT = 28;

// Deterministic pseudo-random heights so server and client render identically.
function heightFor(i: number) {
  const wave = Math.sin(i * 0.7) * 0.5 + Math.sin(i * 1.9) * 0.3;
  return 0.28 + Math.abs(wave) * 0.6;
}

/**
 * A pure-CSS animated waveform, standing in for the TTS speech pipeline.
 * Not a fake app screenshot — an honest abstract visual for an audio
 * project. Animates only `transform` (GPU-safe) and respects
 * prefers-reduced-motion via the global stylesheet rule.
 */
export function AudioWaveform() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-[3px] px-8">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span
          key={i}
          className="w-full max-w-[6px] rounded-full bg-gradient-to-t from-accent-warm/70 to-accent-warm-deep/90"
          style={{
            height: `${heightFor(i) * 100}%`,
            animation: `waveform-pulse 2.4s ease-in-out ${(i % 7) * 0.12}s infinite`,
            transformOrigin: "center",
          }}
        />
      ))}
      <style>{`
        @keyframes waveform-pulse {
          0%, 100% { transform: scaleY(0.55); opacity: 0.75; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

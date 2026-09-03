"use client";

/**
 * A tiny synthesized sound engine — plain oscillators through the Web Audio
 * API, no audio files. Fits the rest of the site's "build the real thing"
 * instinct better than dropping in stock SFX, and it's free of any
 * licensing question.
 *
 * Off by default (a portfolio that makes noise the moment someone opens it
 * is a bad first impression) — see SoundToggle.tsx for the visible control.
 * Preference persists in localStorage across visits.
 */

const STORAGE_KEY = "portfolio-sound-enabled";
let soundEnabled = false;
let audioCtx: AudioContext | null = null;

function loadPreference() {
  if (typeof window === "undefined") return;
  try {
    soundEnabled = window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    // Private browsing / storage disabled — just stays off for the session.
  }
}
loadPreference();

function getAudioContextClass(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  );
}

function getCtx(): AudioContext | null {
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) return null;
  if (!audioCtx) audioCtx = new AudioContextClass();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

/** The one shared AudioContext, for ambient.ts to route a real `<audio>`
 * element through (via createMediaElementSource) so its volume can be
 * ramped with Web Audio gain automation instead of the element's own
 * unanimatable `.volume` property. */
export function getAudioContext(): AudioContext | null {
  return getCtx();
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(value: boolean) {
  soundEnabled = value;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Ignore — preference just won't persist this session.
  }
  // Creating/resuming here happens inside the same click that toggled the
  // switch, so it counts as a user gesture for the browser's autoplay gate.
  if (value) getCtx();
}

export function toggleSound() {
  setSoundEnabled(!soundEnabled);
  return soundEnabled;
}

interface ToneOptions {
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  /** Exponential glide from `freq` to this frequency over the tone's duration. */
  glideTo?: number;
}

/** One short envelope-shaped tone: quick attack (avoids a click/pop),
 * exponential decay to silence. The building block every effect below (and
 * music.ts's generative background music) is made of. Exported so music.ts
 * can reuse it rather than duplicating oscillator/envelope plumbing. */
export function playTone(freq: number, duration: number, opts: ToneOptions = {}) {
  if (!soundEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;

  const { type = "sine", gain = 0.08, delay = 0, glideTo } = opts;
  const t0 = ctx.currentTime + delay;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);

  gainNode.gain.setValueAtTime(0, t0);
  gainNode.gain.linearRampToValueAtTime(gain, t0 + 0.008);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(gainNode).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/** Plays every note of a chord at once — the harmonic building block
 * music.ts's chord pads and stabs are made of. */
export function playChord(freqs: number[], duration: number, opts: ToneOptions = {}) {
  for (const freq of freqs) playTone(freq, duration, opts);
}

/** A synthesized splash for the hero's click ripple: a short bandpass-swept
 * noise burst (the "splash" itself) layered under a quick descending
 * "plink" tone (the droplet) — no sample, same trick as playKick/playHihat. */
export function playSplash() {
  if (!soundEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime;

  const bufferSize = Math.floor(ctx.sampleRate * 0.18);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.6;
  filter.frequency.setValueAtTime(1800, t0);
  filter.frequency.exponentialRampToValueAtTime(350, t0 + 0.18);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.05, t0);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);

  noise.connect(filter).connect(noiseGain).connect(ctx.destination);
  noise.start(t0);

  playTone(950, 0.14, { type: "sine", gain: 0.05, glideTo: 320 });
}

/** A synthesized kick: no sample, just an oscillator whose pitch free-falls
 * from ~150Hz to ~40Hz across a fast decay — the classic 808-style trick. */
export function playKick() {
  if (!soundEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, t0);
  osc.frequency.exponentialRampToValueAtTime(40, t0 + 0.12);
  gainNode.gain.setValueAtTime(0.16, t0);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.15);
  osc.connect(gainNode).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.17);
}

/** A synthesized hi-hat tick: a short burst of filtered white noise, no
 * sample needed — a AudioBufferSourceNode fed random values through a
 * highpass filter. */
export function playHihat() {
  if (!soundEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const bufferSize = Math.floor(ctx.sampleRate * 0.05);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 7000;
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.035, t0);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);

  noise.connect(filter).connect(gainNode).connect(ctx.destination);
  noise.start(t0);
}

const semitone = Math.pow(2, 1 / 12);

/** Snake's eat blip — pitch climbs a whole tone per food in FOOD_ORDER, so a
 * clean run audibly "levels up" instead of repeating the same note. */
export function playEat(pitchStep: number) {
  const freq = 420 * Math.pow(semitone, (pitchStep % 8) * 2);
  playTone(freq, 0.09, { type: "square", gain: 0.07 });
}

/** A quick rising triad when a real run starts. */
export function playGameStart() {
  playTone(392, 0.09, { type: "triangle", gain: 0.08, delay: 0 });
  playTone(523.25, 0.09, { type: "triangle", gain: 0.08, delay: 0.09 });
  playTone(659.25, 0.16, { type: "triangle", gain: 0.09, delay: 0.18 });
}

/** A falling motif on self-collision — a little wistful, not harsh. */
export function playGameOver() {
  playTone(392, 0.16, { type: "sawtooth", gain: 0.06, delay: 0 });
  playTone(329.63, 0.16, { type: "sawtooth", gain: 0.06, delay: 0.14 });
  playTone(261.63, 0.3, { type: "sawtooth", gain: 0.07, delay: 0.28 });
}

/** Generic UI feedback — kept very short and quiet so it reads as tactile
 * confirmation, not a sound effect drawing attention to itself. */
export function playClick() {
  playTone(880, 0.04, { type: "sine", gain: 0.05 });
}

export function playHover() {
  playTone(1400, 0.02, { type: "sine", gain: 0.02 });
}

export function playMenuOpen() {
  playTone(600, 0.07, { type: "triangle", gain: 0.05, glideTo: 900 });
}

export function playMenuClose() {
  playTone(900, 0.07, { type: "triangle", gain: 0.05, glideTo: 500 });
}

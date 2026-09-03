"use client";

import { playChord, playHihat, playKick, playTone } from "./sound";
import { fadeAmbientTo } from "./ambient";

/**
 * Generative background music — no audio files, same instinct as sound.ts:
 * real chords and a bassline scheduled on a clock, not a pre-rendered loop.
 * Both modes share the same A-minor progression (Am9 – Fmaj7 – Cmaj7 – G6,
 * a common ambient/lo-fi loop) so switching between them feels like the
 * same song changing gears, not two unrelated tracks: "calm" holds each
 * chord as a slow soft pad for browsing the page; "energetic" plays the
 * same progression as a proper bassline + chord stabs + lead riff + a
 * synthesized kick/hihat, and kicks in the moment Snake is actually being
 * played (see BgWidgetGrid.tsx's `game.onEvent`), falling back to calm on
 * game over.
 *
 * The scheduler itself keeps running once started even while muted —
 * every note goes through sound.ts's playTone/playChord, which already
 * no-op silently when sound is off, so there's nothing to tear down and
 * restart on every toggle, just a clock ticking quietly in the background
 * that becomes audible the moment sound is enabled.
 */
export type MusicMode = "calm" | "energetic";

interface Chord {
  /** An octave below the pad, for body/bass. */
  root: number;
  /** The pad/stab voicing, low-to-high. */
  notes: number[];
}

// Am9 – Fmaj7 – Cmaj7 – G6, the same shape a lot of lo-fi/ambient loops
// lean on — nothing in it clashes regardless of the order notes land in,
// which matters since the melodic layers below pick notes semi-randomly.
const CHORDS: Chord[] = [
  { root: 110, notes: [220, 261.63, 329.63, 392] }, // Am9  (A3 C4 E4 G4)
  { root: 87.31, notes: [174.61, 220, 261.63, 329.63] }, // Fmaj7 (F3 A3 C4 E4)
  { root: 130.81, notes: [261.63, 329.63, 392, 493.88] }, // Cmaj7 (C4 E4 G4 B4)
  { root: 98, notes: [196, 246.94, 293.66, 329.63] }, // G6    (G3 B3 D4 E4)
];

let mode: MusicMode = "calm";
let running = false;
let timerId: ReturnType<typeof setTimeout> | null = null;

let calmChordIndex = 0;

let beat = 0;
const BEATS_PER_CHORD = 8;
const BEAT_MS = 300; // a loose nod to the snake's own 150ms tick (2 ticks/beat)

function scheduleCalm() {
  const chord = CHORDS[calmChordIndex % CHORDS.length];

  // The pad: the full chord held soft and long, plus the root an octave
  // down for body. Duration (7–7.5s) outlasts the interval between chords
  // (6s), so each new chord fades in while the last is still fading out —
  // that overlap is what makes it sound like one continuous wash instead
  // of a slideshow of notes.
  playChord(chord.notes, 7, { type: "sine", gain: 0.016 });
  playTone(chord.root, 7.5, { type: "sine", gain: 0.02 });

  // A sparse melodic note on top, drawn from the current chord (so it's
  // always consonant with the pad underneath) an octave up for a bell-like
  // register.
  if (Math.random() < 0.7) {
    const freq = chord.notes[Math.floor(Math.random() * chord.notes.length)] * 2;
    playTone(freq, 1.6 + Math.random() * 0.8, {
      type: "triangle",
      gain: 0.02,
      delay: 1 + Math.random() * 3.5,
    });
  }

  calmChordIndex++;
  timerId = setTimeout(tick, 6000);
}

function scheduleEnergetic() {
  const chordIndex = Math.floor(beat / BEATS_PER_CHORD) % CHORDS.length;
  const chord = CHORDS[chordIndex];
  const beatInChord = beat % BEATS_PER_CHORD;

  playKick();
  if (beat % 2 === 1) playHihat();

  // Bass pulses the chord's root every beat — the actual rhythmic anchor.
  playTone(chord.root, 0.14, { type: "square", gain: 0.05 });

  // A full chord stab right as each new chord begins.
  if (beatInChord === 0) {
    playChord(chord.notes, 0.32, { type: "triangle", gain: 0.032, delay: 0.02 });
  }

  // A lead line arpeggiating up through the chord tones, an octave up.
  const leadFreq = chord.notes[beatInChord % chord.notes.length] * 2;
  playTone(leadFreq, 0.16, { type: "triangle", gain: 0.045, delay: 0.08 });

  beat++;
  timerId = setTimeout(tick, BEAT_MS);
}

function tick() {
  if (!running) return;
  if (mode === "calm") scheduleCalm();
  else scheduleEnergetic();
}

/** Idempotent — safe to call every time sound gets enabled. */
export function startMusic() {
  if (running) return;
  running = true;
  beat = 0;
  calmChordIndex = 0;
  tick();
}

export function stopMusic() {
  running = false;
  if (timerId) clearTimeout(timerId);
  timerId = null;
}

/** Switches mode immediately (restarts the clock on the new mode right
 * away) rather than waiting out whatever's left of the old mode's gap —
 * a "GAME ON" moment should feel like the music actually reacted to it. */
export function setMusicMode(next: MusicMode) {
  if (next === mode) return;
  mode = next;
  beat = 0;
  fadeAmbientTo(next);
  if (!running) return;
  if (timerId) clearTimeout(timerId);
  tick();
}

export function getMusicMode() {
  return mode;
}

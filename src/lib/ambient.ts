"use client";

import { getAudioContext, isSoundEnabled } from "./sound";

/**
 * The real calm-mode layer: "Calm Ambient" by leberch (Pixabay Content
 * License — free for commercial use, no attribution required),
 * https://pixabay.com/music/modern-classical-calm-ambient-354930/. Sits
 * alongside the generative synthesized system (music.ts/sound.ts) rather
 * than replacing it — this is the calm background bed; the energetic mode
 * and every game/UI sound effect are still synthesized, since only those
 * need to react instantly to what's happening on the page.
 *
 * Routed through the shared AudioContext via createMediaElementSource so
 * its volume can be smoothly ramped (a plain <audio> element's `.volume`
 * can't be animated), and faded out/in — never paused/resumed — when
 * music.ts switches modes, so the crossfade is click-free.
 */
const AMBIENT_SRC = "/audio/calm-ambient.mp3";
const FADE_SECONDS = 1.5;
// Sits under the synthesized layers rather than dominating them.
const TARGET_GAIN = 0.3;

let audioEl: HTMLAudioElement | null = null;
let gainNode: GainNode | null = null;
let currentMode: "calm" | "energetic" = "calm";
let started = false;

function ensureGraph(): GainNode | null {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (!audioEl) {
    audioEl = new Audio(AMBIENT_SRC);
    audioEl.loop = true;
  }
  if (!gainNode) {
    const source = ctx.createMediaElementSource(audioEl);
    gainNode = ctx.createGain();
    gainNode.gain.value = 0;
    source.connect(gainNode).connect(ctx.destination);
  }
  return gainNode;
}

function rampTo(target: number) {
  const ctx = getAudioContext();
  if (!ctx || !gainNode) return;
  gainNode.gain.cancelScheduledValues(ctx.currentTime);
  gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(target, ctx.currentTime + FADE_SECONDS);
}

function targetGain() {
  return isSoundEnabled() && currentMode === "calm" ? TARGET_GAIN : 0;
}

/** Idempotent — safe to call every time sound gets enabled. Playback starts
 * inside the same click that enables sound, so it counts as the user
 * gesture the browser's autoplay gate needs. */
export function startAmbient() {
  if (started) return;
  const gain = ensureGraph();
  if (!gain || !audioEl) return;
  started = true;
  audioEl.play().catch(() => {
    // Autoplay blocked for some reason — the next real click anywhere
    // resumes the shared context (see sound.ts's playTone), and this
    // <audio> element is already mid-`play()` waiting on it.
  });
  rampTo(targetGain());
}

/** Called by music.ts whenever it switches mode. */
export function fadeAmbientTo(mode: "calm" | "energetic") {
  currentMode = mode;
  if (!started) return;
  rampTo(targetGain());
}

/** Called by SoundToggle on every mute/unmute — reads the current
 * enabled/mode state itself via targetGain() rather than taking a param,
 * since sound.ts's isSoundEnabled() is already the single source of truth. */
export function refreshAmbientGain() {
  if (!started) return;
  rampTo(targetGain());
}

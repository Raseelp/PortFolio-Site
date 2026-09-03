"use client";

import { getAudioContext, isSoundEnabled } from "./sound";

/**
 * A continuous hum tied to the site's pointer-physics effects — every
 * repelling tech icon and every magnetic timeline/branch node reports how
 * strongly it's currently being pushed/pulled (see usePointerPhysics.ts),
 * and this smoothly rides that in real time: louder and higher-pitched the
 * bigger the displacement, fading to true silence the instant nothing is
 * being displaced. Two oscillators, always running once started (silent by
 * default) rather than started/stopped per interaction — starting a fresh
 * oscillator on every pointermove would be constant clicking; ramping an
 * always-on one is what makes this actually smooth.
 */
const REPEL_BASE_FREQ = 560;
const REPEL_FREQ_RANGE = 420;
const REPEL_MAX_GAIN = 0.05;

const ATTRACT_BASE_FREQ = 160;
const ATTRACT_FREQ_RANGE = 140;
const ATTRACT_MAX_GAIN = 0.06;

// How quickly the ramp chases its target — small enough to feel immediate,
// large enough that rapid mouse movement never zippers/clicks.
const RAMP_TIME_CONSTANT = 0.09;

let repelAccum = 0;
let attractAccum = 0;

let repelOsc: OscillatorNode | null = null;
let repelGain: GainNode | null = null;
let attractOsc: OscillatorNode | null = null;
let attractGain: GainNode | null = null;

let running = false;
let rafId: number | null = null;

function buildRepelVoice(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = REPEL_BASE_FREQ;
  gain.gain.value = 0;
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  repelOsc = osc;
  repelGain = gain;
}

function buildAttractVoice(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = ATTRACT_BASE_FREQ;
  filter.type = "lowpass";
  filter.frequency.value = 700;
  gain.gain.value = 0;
  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start();
  attractOsc = osc;
  attractGain = gain;
}

function frame() {
  if (!running) return;
  const ctx = getAudioContext();
  if (ctx && repelGain && repelOsc && attractGain && attractOsc) {
    const enabled = isSoundEnabled();
    const repelTarget = enabled ? repelAccum : 0;
    const attractTarget = enabled ? attractAccum : 0;

    repelGain.gain.setTargetAtTime(repelTarget * REPEL_MAX_GAIN, ctx.currentTime, RAMP_TIME_CONSTANT);
    repelOsc.frequency.setTargetAtTime(
      REPEL_BASE_FREQ + repelTarget * REPEL_FREQ_RANGE,
      ctx.currentTime,
      RAMP_TIME_CONSTANT
    );

    attractGain.gain.setTargetAtTime(attractTarget * ATTRACT_MAX_GAIN, ctx.currentTime, RAMP_TIME_CONSTANT);
    attractOsc.frequency.setTargetAtTime(
      ATTRACT_BASE_FREQ + attractTarget * ATTRACT_FREQ_RANGE,
      ctx.currentTime,
      RAMP_TIME_CONSTANT
    );
  }
  // Collected since the last frame — reset so silence (no new pointermove
  // reports at all) actually reads as silence rather than a stuck value.
  repelAccum = 0;
  attractAccum = 0;
  rafId = requestAnimationFrame(frame);
}

/** Idempotent — safe to call every time sound gets enabled. */
export function startPhysicsSound() {
  if (running) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  running = true;
  buildRepelVoice(ctx);
  buildAttractVoice(ctx);
  rafId = requestAnimationFrame(frame);
}

/** Called continuously by usePointerPhysics — `fraction` is 0 (out of
 * range) to 1 (right on top of the cursor). Only the loudest reporter each
 * frame matters, not the sum, so a cluster of icons near the cursor
 * doesn't shove the volume up beyond what one alone would. */
export function reportPhysicsForce(mode: "attract" | "repel", fraction: number) {
  if (mode === "repel") repelAccum = Math.max(repelAccum, fraction);
  else attractAccum = Math.max(attractAccum, fraction);
}

export function stopPhysicsSound() {
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

import { CalculateMetadataFunction, Easing, interpolate, spring } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Springy entrance progress 0 → 1, starting `delay` frames in. damping 200 = no overshoot.
export const enter = (frame: number, fps: number, delay = 0, damping = 200) =>
  spring({ frame: frame - delay, fps, config: { damping } });

// Exit progress 0 → 1 over the last `length` frames of the clip.
export const exit = (frame: number, duration: number, length = 12) =>
  interpolate(frame, [duration - length, duration], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });

export const lerp = (p: number, from: number, to: number) => from + (to - from) * p;

export const range = (frame: number, input: [number, number], output: [number, number]) =>
  interpolate(frame, input, output, { ...clamp, easing: Easing.out(Easing.cubic) });

type Timed = { durationSec: number; fps: number };

// Opaque clips (intro, outro, full-screen cards): length and fps come from props.
export const timed =
  <T extends Timed>(): CalculateMetadataFunction<T> =>
  ({ props }) => ({
    durationInFrames: Math.max(1, Math.round(props.durationSec * props.fps)),
    fps: props.fps,
  });

// Overlay clips render with an alpha channel (ProRes 4444) so FFmpeg can lay them over footage.
export const timedAlpha =
  <T extends Timed>(): CalculateMetadataFunction<T> =>
  ({ props }) => ({
    durationInFrames: Math.max(1, Math.round(props.durationSec * props.fps)),
    fps: props.fps,
    defaultCodec: "prores",
    defaultProResProfile: "4444",
    defaultVideoImageFormat: "png",
    defaultPixelFormat: "yuva444p10le",
  });

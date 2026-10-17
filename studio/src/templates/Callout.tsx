import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../brand";
import { enter, exit } from "../lib/motion";

// Spotlight a region of a screen recording: dims everything else, outlines the box, adds a label.
// x/y/w/h are in the output frame's pixels (find them from a still of the footage).
export type CalloutProps = {
  durationSec: number;
  fps: number;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  labelPosition: "top" | "bottom";
  dim: number; // 0–1, how dark the rest of the screen gets
};

export const calloutDefaults: CalloutProps = {
  durationSec: 4,
  fps: 30,
  x: 640,
  y: 360,
  w: 640,
  h: 300,
  label: "এখানে ক্লিক করুন",
  labelPosition: "bottom",
  dim: 0.55,
};

export const Callout: React.FC<CalloutProps> = ({ x, y, w, h, label, labelPosition, dim }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const c = brand.colors;

  const inP = enter(frame, fps, 0);
  const tag = enter(frame, fps, 8);
  const out = exit(frame, durationInFrames, 10);
  const vis = inP * (1 - out);
  const grow = 1.08 - 0.08 * inP; // box settles from slightly larger onto the target
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 2 * 0.8);

  return (
    <AbsoluteFill style={{ fontFamily: brand.fonts.body }}>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          borderRadius: 18,
          transform: `scale(${grow})`,
          border: `6px solid ${c.accent}`,
          // the huge spread shadow is the dimmed surround
          boxShadow: `0 0 0 4000px rgba(0,0,0,${dim * vis}), 0 0 ${18 + pulse * 18}px ${c.accent}AA`,
          opacity: vis,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x,
          top: labelPosition === "bottom" ? y + h + 22 : undefined,
          bottom: labelPosition === "top" ? 1080 - y + 22 : undefined,
          background: c.accent,
          color: c.bg,
          fontSize: 44,
          fontWeight: 700,
          padding: "10px 28px 12px",
          borderRadius: 999,
          whiteSpace: "nowrap",
          opacity: tag * (1 - out),
          transform: `translateY(${(1 - tag) * (labelPosition === "bottom" ? -14 : 14)}px)`,
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};

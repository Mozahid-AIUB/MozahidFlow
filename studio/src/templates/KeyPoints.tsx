import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../brand";
import { enter, exit } from "../lib/motion";

export type KeyPointsProps = {
  durationSec: number;
  fps: number;
  heading: string;
  points: string[];
  fullscreen: boolean; // false = right-side panel over the footage (render with alpha)
  stepSec: number; // gap between bullets; match it to when each point is spoken
};

export const keyPointsDefaults: KeyPointsProps = {
  durationSec: 8,
  fps: 30,
  heading: "মূল পয়েন্ট",
  points: ["প্রথম গুরুত্বপূর্ণ কথা", "দ্বিতীয় গুরুত্বপূর্ণ কথা", "তৃতীয় গুরুত্বপূর্ণ কথা"],
  fullscreen: false,
  stepSec: 1.2,
};

export const KeyPoints: React.FC<KeyPointsProps> = ({ heading, points, fullscreen, stepSec }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();
  const c = brand.colors;

  const panel = enter(frame, fps, 0);
  const out = exit(frame, durationInFrames, 12);
  const panelW = fullscreen ? width : width * 0.42;

  return (
    <AbsoluteFill style={{ fontFamily: brand.fonts.body }}>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: panelW,
          background: fullscreen ? c.bg : `${c.surface}F2`,
          clipPath: `inset(0 0 0 ${(1 - panel * (1 - out)) * 100}%)`,
          padding: fullscreen ? `0 ${width * 0.12}px` : "0 90px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ fontFamily: brand.fonts.display, color: c.accent, fontSize: fullscreen ? 84 : 64, fontWeight: 700, marginBottom: 40 }}>
          {heading}
        </div>
        {points.map((pt, i) => {
          const p = enter(frame, fps, 10 + Math.round(i * stepSec * fps));
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 26,
                marginBottom: 30,
                opacity: p,
                transform: `translateX(${(1 - p) * 40}px)`,
              }}
            >
              <div
                style={{
                  flex: "none",
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  background: c.accent,
                  color: c.bg,
                  fontSize: 34,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 6,
                }}
              >
                {(i + 1).toLocaleString("bn-BD")}
              </div>
              <div style={{ color: c.text, fontSize: fullscreen ? 58 : 48, fontWeight: 500, lineHeight: 1.35 }}>{pt}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

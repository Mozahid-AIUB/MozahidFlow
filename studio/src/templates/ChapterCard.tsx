import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../brand";
import { enter, exit } from "../lib/motion";

export type ChapterCardProps = {
  durationSec: number;
  fps: number;
  number: string; // "০১"
  label: string; // "পর্ব"
  title: string;
  fullscreen: boolean; // false = side panel over the footage (render with alpha)
};

export const chapterDefaults: ChapterCardProps = {
  durationSec: 3,
  fps: 30,
  number: "০১",
  label: "পর্ব",
  title: "শুরুর কথা",
  fullscreen: true,
};

export const ChapterCard: React.FC<ChapterCardProps> = ({ number, label, title, fullscreen }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();
  const c = brand.colors;

  const wipe = enter(frame, fps, 0);
  const num = enter(frame, fps, 5);
  const ttl = enter(frame, fps, 10);
  const out = exit(frame, durationInFrames, 12);
  const panelW = fullscreen ? width : width * 0.46;

  return (
    <AbsoluteFill style={{ fontFamily: brand.fonts.body }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: panelW,
          background: fullscreen ? c.bg : `${c.bg}EE`,
          // wipe in from the left, wipe out to the right
          clipPath: `inset(0 ${(1 - wipe) * 100}% 0 ${out * 100}%)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: fullscreen ? width * 0.12 : 110,
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: c.accent }} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 24, opacity: num, transform: `translateX(${(1 - num) * -40}px)` }}>
          <span style={{ color: c.accent, fontSize: 46, fontWeight: 600 }}>{label}</span>
          <span
            style={{
              fontFamily: brand.fonts.display,
              fontSize: fullscreen ? 220 : 160,
              fontWeight: 800,
              lineHeight: 1,
              color: "transparent",
              WebkitTextStroke: `4px ${c.accent}`,
            }}
          >
            {number}
          </span>
        </div>
        <div
          style={{
            fontFamily: brand.fonts.display,
            fontSize: fullscreen ? 96 : 72,
            fontWeight: 700,
            color: c.text,
            lineHeight: 1.2,
            marginTop: 24,
            maxWidth: panelW - 220,
            opacity: ttl,
            transform: `translateY(${(1 - ttl) * 30}px)`,
          }}
        >
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};

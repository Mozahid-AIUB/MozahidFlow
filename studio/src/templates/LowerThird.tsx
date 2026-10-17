import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../brand";
import { enter, exit } from "../lib/motion";

export type LowerThirdProps = {
  durationSec: number;
  fps: number;
  title: string;
  subtitle: string;
  side: "left" | "right";
};

export const lowerThirdDefaults: LowerThirdProps = {
  durationSec: 5,
  fps: 30,
  title: "মূল কথা এখানে",
  subtitle: "ছোট ব্যাখ্যা বা নাম/পদবি",
  side: "left",
};

export const LowerThird: React.FC<LowerThirdProps> = ({ title, subtitle, side }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const c = brand.colors;

  const bar = enter(frame, fps, 0);
  const box = enter(frame, fps, 5);
  const sub = enter(frame, fps, 11);
  const out = exit(frame, durationInFrames, 12);
  const reveal = box * (1 - out);
  const fromRight = side === "right";

  return (
    <AbsoluteFill style={{ fontFamily: brand.fonts.body }}>
      <div
        style={{
          position: "absolute",
          bottom: 110,
          [fromRight ? "right" : "left"]: 96,
          display: "flex",
          flexDirection: fromRight ? "row-reverse" : "row",
          alignItems: "stretch",
        }}
      >
        <div style={{ width: 12, borderRadius: 6, background: c.accent, transform: `scaleY(${bar * (1 - out)})` }} />
        <div
          style={{
            background: `${c.bg}E6`,
            padding: "22px 40px 24px",
            borderRadius: 14,
            [fromRight ? "marginRight" : "marginLeft"]: 14,
            clipPath: fromRight ? `inset(0 0 0 ${(1 - reveal) * 100}%)` : `inset(0 ${(1 - reveal) * 100}% 0 0)`,
            boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ fontFamily: brand.fonts.display, color: c.text, fontSize: 60, fontWeight: 700, lineHeight: 1.2, whiteSpace: "nowrap" }}>
            {title}
          </div>
          <div style={{ color: c.accent, fontSize: 36, fontWeight: 500, marginTop: 6, whiteSpace: "nowrap", opacity: sub * (1 - out) }}>
            {subtitle}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../brand";
import { enter, exit, lerp } from "../lib/motion";

export type IntroProps = {
  durationSec: number;
  fps: number;
  kicker: string; // small line above the title, e.g. the series name
  title: string; // "\n" splits lines
  subtitle: string;
};

export const introDefaults: IntroProps = {
  durationSec: 4.5,
  fps: 30,
  kicker: brand.channelName,
  title: "ভিডিওর মূল টপিক\nএখানে লিখুন",
  subtitle: "সহজ ভাষায় পুরো ব্যাখ্যা",
};

export const Intro: React.FC<IntroProps> = ({ kicker, title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();
  const c = brand.colors;
  const lines = title.split("\n");

  const bar = enter(frame, fps, 0);
  const kick = enter(frame, fps, 6);
  const sub = enter(frame, fps, 10 + lines.length * 6);
  const out = exit(frame, durationInFrames, 14);
  const drift = lerp(frame / durationInFrames, 0, 60);

  return (
    <AbsoluteFill style={{ backgroundColor: c.bg, fontFamily: brand.fonts.body, opacity: 1 - out }}>
      {/* slow drifting glow + faint grid give depth without competing with the title */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${30 + drift / 3}% ${40 + drift / 6}%, ${c.accent}26 0%, transparent 45%),
                       radial-gradient(circle at ${80 - drift / 4}% 80%, ${c.accent2}22 0%, transparent 40%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${c.text}0A 1px, transparent 1px), linear-gradient(90deg, ${c.text}0A 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          transform: `translateY(${-drift / 2}px)`,
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: width * 0.09, transform: `scale(${1 + out * 0.04})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, opacity: kick, transform: `translateY(${(1 - kick) * 20}px)` }}>
          {brand.logo ? <Img src={staticFile(brand.logo)} style={{ height: 56 }} /> : null}
          <div style={{ color: c.muted, fontSize: 38, fontWeight: 500, letterSpacing: 1 }}>{kicker}</div>
        </div>
        <div style={{ height: 10, width: 140 * bar, background: c.accent, borderRadius: 5, margin: "28px 0 36px" }} />
        {lines.map((line, i) => {
          const p = enter(frame, fps, 8 + i * 6);
          return (
            <div key={i} style={{ overflow: "hidden", paddingBottom: 8 }}>
              <div
                style={{
                  fontFamily: brand.fonts.display,
                  fontWeight: 700,
                  fontSize: 118,
                  lineHeight: 1.18,
                  color: i === lines.length - 1 ? c.accent : c.text,
                  transform: `translateY(${(1 - p) * 110}%)`,
                }}
              >
                {line}
              </div>
            </div>
          );
        })}
        <div style={{ color: c.muted, fontSize: 44, marginTop: 30, opacity: sub, transform: `translateY(${(1 - sub) * 16}px)` }}>
          {subtitle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

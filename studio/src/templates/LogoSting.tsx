import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../brand";
import { LogoMark } from "../components/LogoMark";
import { enter, exit } from "../lib/motion";

// 3 s brand sting for the start or end of every video: the monogram builds itself, then the name and
// tagline settle in. Works landscape (1920×1080) and portrait (1080×1920, Reels/Shorts).
export type LogoStingProps = {
  durationSec: number;
  fps: number;
  orientation: "landscape" | "portrait";
  showName: boolean;
  line: "tagline" | "taglineBn" | "website" | "handle";
};

export const logoStingDefaults: LogoStingProps = {
  durationSec: 3,
  fps: 30,
  orientation: "landscape",
  showName: true,
  line: "tagline",
};

export const LogoSting: React.FC<LogoStingProps> = ({ showName, line }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const c = brand.colors;
  const portrait = height > width;

  const build = interpolate(frame, [4, 4 + fps * 1.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const name = enter(frame, fps, Math.round(fps * 0.85));
  const sub = enter(frame, fps, Math.round(fps * 1.05));
  const out = exit(frame, durationInFrames, Math.round(fps * 0.4));
  const settle = interpolate(frame, [0, durationInFrames], [1.04, 1], { easing: Easing.out(Easing.cubic) });
  const sweep = interpolate(frame, [fps * 0.9, fps * 1.7], [-30, 130], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const logoH = portrait ? 300 : 250;
  const lineText = { tagline: brand.tagline, taglineBn: brand.taglineBn, website: brand.website, handle: `YouTube ${brand.handle}` }[line];

  return (
    <AbsoluteFill style={{ backgroundColor: c.bg, opacity: 1 - out }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% ${portrait ? 42 : 45}%, ${c.emerald}24 0%, transparent 55%)`,
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: portrait ? 56 : 44,
          transform: `scale(${settle})`,
        }}
      >
        <div style={{ position: "relative" }}>
          <LogoMark height={logoH} variant="onDark" progress={build} />
          {/* one soft light sweep across the finished mark, masked to the logo's shape */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(105deg, transparent ${sweep - 12}%, rgba(255,255,255,0.35) ${sweep}%, transparent ${sweep + 12}%)`,
              WebkitMaskImage: `url(${staticFile(brand.logoWhite)})`,
              WebkitMaskSize: "100% 100%",
              maskImage: `url(${staticFile(brand.logoWhite)})`,
              maskSize: "100% 100%",
            }}
          />
        </div>
        {showName ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: brand.fonts.latin,
                fontWeight: 600,
                fontSize: portrait ? 76 : 72,
                letterSpacing: 1,
                color: c.text,
                opacity: name,
                transform: `translateY(${(1 - name) * 18}px)`,
              }}
            >
              {brand.name}
            </div>
            <div style={{ height: 3, width: 120 * sub, background: c.accent, margin: "20px auto 22px", borderRadius: 2 }} />
            <div
              style={{
                fontFamily: line === "taglineBn" ? brand.fonts.body : brand.fonts.latin,
                fontWeight: 400,
                fontSize: portrait ? 38 : 34,
                letterSpacing: line === "taglineBn" ? 0 : 0.5,
                color: c.muted,
                opacity: sub,
              }}
            >
              {lineText}
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

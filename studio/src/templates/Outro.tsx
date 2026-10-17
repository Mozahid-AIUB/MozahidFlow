import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../brand";
import { enter, exit } from "../lib/motion";

// YouTube end screens need 5–20 s at the end of the video. The outlined boxes mark where the
// end-screen elements (two videos + subscribe) will be placed in YouTube Studio, so nothing
// important sits under them.
export type OutroProps = {
  durationSec: number;
  fps: number;
  thanks: string;
  cta: string;
  showEndScreenGuides: boolean;
};

export const outroDefaults: OutroProps = {
  durationSec: 12,
  fps: 30,
  thanks: "দেখার জন্য ধন্যবাদ!",
  cta: "পরের ভিডিওটাও দেখে নিন 👉",
  showEndScreenGuides: true,
};

export const Outro: React.FC<OutroProps> = ({ thanks, cta, showEndScreenGuides }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const c = brand.colors;

  const a = enter(frame, fps, 0);
  const b = enter(frame, fps, 8);
  const boxes = enter(frame, fps, 14);
  const out = exit(frame, durationInFrames, 15);

  const guide: React.CSSProperties = {
    position: "absolute",
    border: `3px dashed ${c.muted}66`,
    borderRadius: 16,
    opacity: boxes,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: `${c.muted}AA`,
    fontSize: 30,
  };

  return (
    <AbsoluteFill style={{ backgroundColor: c.bg, fontFamily: brand.fonts.body, opacity: 1 - out }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 25% 30%, ${c.accent}22 0%, transparent 45%)` }} />
      <div style={{ position: "absolute", left: 120, top: 150, width: 820 }}>
        <div style={{ fontFamily: brand.fonts.display, color: c.text, fontSize: 92, fontWeight: 700, lineHeight: 1.2, opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
          {thanks}
        </div>
        <div style={{ color: c.accent, fontSize: 48, fontWeight: 600, marginTop: 30, opacity: b, transform: `translateY(${(1 - b) * 20}px)` }}>
          {cta}
        </div>
        <div style={{ color: c.muted, fontSize: 38, marginTop: 50, opacity: b }}>
          {brand.channelName} · {brand.handle}
        </div>
      </div>
      {showEndScreenGuides ? (
        <>
          <div style={{ ...guide, left: 1060, top: 150, width: 740, height: 416 }}>ভিডিও ১</div>
          <div style={{ ...guide, left: 1060, top: 620, width: 740, height: 416 }}>ভিডিও ২</div>
          <div style={{ ...guide, left: 330, top: 640, width: 300, height: 300, borderRadius: 999 }}>সাবস্ক্রাইব</div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

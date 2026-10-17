import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../brand";
import { enter, exit } from "../lib/motion";

export type SubscribeReminderProps = {
  durationSec: number;
  fps: number;
  platform: "youtube" | "facebook";
};

export const subscribeDefaults: SubscribeReminderProps = {
  durationSec: 4,
  fps: 30,
  platform: "youtube",
};

const copy = {
  youtube: { before: "সাবস্ক্রাইব", after: "সাবস্ক্রাইবড", color: brand.colors.youtubeRed },
  facebook: { before: "ফলো করুন", after: "ফলো করছেন", color: brand.colors.facebookBlue },
};

const Bell: React.FC<{ angle: number; color: string }> = ({ angle, color }) => (
  <svg width="46" height="46" viewBox="0 0 24 24" style={{ transform: `rotate(${angle}deg)`, transformOrigin: "50% 10%" }}>
    <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5.5-6.84V3.5a1.5 1.5 0 0 0-3 0v.66A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z" fill={color} />
  </svg>
);

const Cursor: React.FC = () => (
  <svg width="54" height="54" viewBox="0 0 24 24">
    <path d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.4-6.9L4 20z" fill="#fff" stroke="#000" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

export const SubscribeReminder: React.FC<SubscribeReminderProps> = ({ platform }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const c = brand.colors;
  const t = copy[platform];

  const pop = enter(frame, fps, 0, 14); // a touch of overshoot on the pop-in
  const out = exit(frame, durationInFrames, 10);
  const clickAt = Math.round(fps * 1.3);
  const clicked = frame >= clickAt;
  const press = interpolate(frame, [clickAt - 3, clickAt, clickAt + 4], [1, 0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cursorP = enter(frame, fps, 8);
  const ring = clicked ? Math.sin((frame - clickAt) / 2) * 18 * Math.max(0, 1 - (frame - clickAt) / 20) : 0;

  return (
    <AbsoluteFill style={{ fontFamily: brand.fonts.body }}>
      <div
        style={{
          position: "absolute",
          right: 110,
          bottom: 120,
          display: "flex",
          alignItems: "center",
          gap: 22,
          transform: `scale(${pop * (1 - out) * press})`,
          transformOrigin: "right center",
        }}
      >
        <div
          style={{
            background: clicked ? "#3A3F4A" : t.color,
            color: "#fff",
            fontSize: 46,
            fontWeight: 700,
            padding: "14px 40px 18px",
            borderRadius: 999,
            boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
          }}
        >
          {clicked ? `${t.after} ✓` : t.before}
        </div>
        {platform === "youtube" ? (
          <div style={{ background: `${c.bg}D9`, borderRadius: 999, padding: 14, display: "flex" }}>
            <Bell angle={ring} color={clicked ? c.accent : c.text} />
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          right: interpolate(cursorP, [0, 1], [-40, platform === "youtube" ? 260 : 190]),
          bottom: interpolate(cursorP, [0, 1], [20, 110]),
          opacity: (1 - out) * cursorP,
          transform: `scale(${clicked && frame < clickAt + 4 ? 0.85 : 1})`,
        }}
      >
        <Cursor />
      </div>
    </AbsoluteFill>
  );
};

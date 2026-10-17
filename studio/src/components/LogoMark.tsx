import { Easing, interpolate } from "remotion";
import { brand } from "../brand";

// The "Mi" monogram as live SVG (same geometry as assets/brand/logo*.svg), so it stays sharp at any size and
// can be built part by part. progress 0 → 1 runs the build-on; leave it at 1 for a static logo.
export type LogoVariant = "onDark" | "light" | "white";

const palettes: Record<LogoVariant, { main: string; deep: string }> = {
  onDark: { main: brand.colors.emerald, deep: brand.colors.emeraldDeep },
  light: { main: brand.colors.brandGreen, deep: brand.colors.brandDeep },
  white: { main: "#FFFFFF", deep: "#FFFFFF" },
};

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const part = (p: number, start: number, end: number) =>
  interpolate(p, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

// Grow along one axis from an edge of the shape's own box.
const grow = (axis: "X" | "Y", origin: string, k: number): React.CSSProperties => ({
  transformBox: "fill-box",
  transformOrigin: origin,
  transform: `scale${axis}(${k})`,
});

export const LogoMark: React.FC<{
  height: number;
  variant?: LogoVariant;
  progress?: number;
  style?: React.CSSProperties;
}> = ({ height, variant = "onDark", progress = 1, style }) => {
  const { main, deep } = palettes[variant];
  const width = (height * 380) / 430;

  const stemL = part(progress, 0.0, 0.35);
  const diagDeep = part(progress, 0.15, 0.5);
  const diagMain = part(progress, 0.3, 0.65);
  const legs = part(progress, 0.42, 0.8);
  const dotIn = part(progress, 0.7, 1);
  // tiny overshoot on the dot: the one playful beat in an otherwise calm build
  const dotScale = dotIn < 1 ? dotIn * (1 + 0.18 * Math.sin(dotIn * Math.PI)) : 1;

  return (
    <svg width={width} height={height} viewBox="0 0 380 430" style={style}>
      <defs>
        <clipPath id="mi-deep">
          <rect x="0" y="90" width="380" height={172 * diagDeep} />
        </clipPath>
        <clipPath id="mi-main">
          <rect x="0" y={262 - 172 * diagMain} width="380" height={172 * diagMain} />
        </clipPath>
      </defs>
      <rect x="40" y="90" width="50" height="202" fill={main} style={grow("Y", "50% 100%", stemL)} />
      <polygon points="172,262 160,180 240,90 340,90 340,120 248,120 248,155" fill={main} clipPath="url(#mi-main)" />
      <rect x="248" y="110" width="38" height="268" fill={main} style={grow("Y", "50% 0%", legs)} />
      <rect x="300" y="90" width="40" height="202" fill={main} style={grow("Y", "50% 0%", legs)} />
      <polygon points="50,90 98,90 196,226 172,262" fill={deep} clipPath="url(#mi-deep)" />
      <rect
        x="298"
        y="26"
        width="42"
        height="42"
        fill={deep}
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%", transform: `scale(${dotScale})` }}
      />
    </svg>
  );
};

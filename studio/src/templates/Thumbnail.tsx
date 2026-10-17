import { AbsoluteFill, Img, staticFile } from "remotion";
import { brand } from "../brand";

// 1280×720 still for YouTube (and Facebook). Keep the title to 3–6 big words; the highlight
// word gets the accent box. `image` is a file in public/ (a face shot or a key frame).
export type ThumbnailProps = {
  title: string; // "\n" splits lines
  highlight: string; // must appear inside title to be boxed
  image: string | null;
  badge: string;
};

export const thumbnailDefaults: ThumbnailProps = {
  title: "এই ভুলটা\nকরবেন না!",
  highlight: "ভুলটা",
  image: null,
  badge: brand.channelName,
};

const withHighlight = (line: string, word: string) => {
  if (!word || !line.includes(word)) return line;
  const [before, after] = line.split(word);
  return (
    <>
      {before}
      <span
        style={{ background: brand.colors.accent, color: brand.colors.bg, padding: "0 18px", borderRadius: 14, WebkitTextStroke: "0px", textShadow: "none" }}
      >
        {word}
      </span>
      {after}
    </>
  );
};

export const Thumbnail: React.FC<ThumbnailProps> = ({ title, highlight, image, badge }) => {
  const c = brand.colors;
  return (
    <AbsoluteFill style={{ backgroundColor: c.bg, fontFamily: brand.fonts.display }}>
      {image ? (
        <Img src={staticFile(image)} style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "62%", objectFit: "cover" }} />
      ) : (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 78% 50%, ${c.accent2}55 0%, transparent 55%)` }} />
      )}
      <AbsoluteFill style={{ background: `linear-gradient(90deg, ${c.bg} 0%, ${c.bg}F0 42%, ${c.bg}00 75%)` }} />
      <div style={{ position: "absolute", left: 64, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", width: 820 }}>
        {title.split("\n").map((line, i) => (
          <div
            key={i}
            style={{
              color: c.text,
              fontSize: 128,
              fontWeight: 800,
              lineHeight: 1.22,
              WebkitTextStroke: `3px ${c.bg}`,
              textShadow: "0 8px 0 rgba(0,0,0,0.45)",
              marginBottom: 6,
            }}
          >
            {withHighlight(line, highlight)}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 64,
          bottom: 44,
          fontFamily: brand.fonts.body,
          fontSize: 32,
          fontWeight: 600,
          color: c.text,
          background: `${c.surface}E6`,
          padding: "8px 22px 10px",
          borderRadius: 12,
          borderLeft: `8px solid ${c.accent}`,
        }}
      >
        {badge}
      </div>
    </AbsoluteFill>
  );
};

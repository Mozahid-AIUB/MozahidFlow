// Channel branding shared by every template. Change these once; every video picks them up.
// Put the logo file in public/brand/ and set `logo` to e.g. "brand/logo.png".
export const brand = {
  channelName: "আপনার চ্যানেল",
  handle: "@yourchannel",
  logo: null as string | null,
  colors: {
    bg: "#0B0F17",
    surface: "#151B27",
    text: "#F4F6FA",
    muted: "#9AA3B2",
    accent: "#FFB020",
    accent2: "#3B82F6",
    youtubeRed: "#FF0033",
    facebookBlue: "#1877F2",
  },
  // Every Bengali family below also contains Latin glyphs, so mixed বাংলা + English text renders in one font.
  fonts: {
    body: "'Hind Siliguri', 'Poppins', sans-serif",
    display: "'Anek Bangla', 'Hind Siliguri', sans-serif",
    rounded: "'Baloo Da 2', 'Hind Siliguri', sans-serif",
    latinDisplay: "'Bebas Neue', 'Anek Bangla', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
};

export type Brand = typeof brand;

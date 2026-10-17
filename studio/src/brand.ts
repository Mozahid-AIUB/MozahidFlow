// Brand kit for Mozahidul Islam: shared by every template. Source files live in D:\Video\assets\brand
// (logo SVG masters + PNG exports, brand.md). Copies used by renders are in public/brand/.
export const brand = {
  name: "Mozahidul Islam",
  channelName: "Mozahidul Islam",
  handle: "@Mozahid_AIUB", // YouTube handle
  website: "mozahidulislam.pro.bd",
  youtube: "https://www.youtube.com/@Mozahid_AIUB",
  facebook: "https://www.facebook.com/profile.php?id=61592240008689",
  tagline: "Software Engineer · Web, Mobile & AI",
  taglineBn: "সফটওয়্যার ইঞ্জিনিয়ার · ওয়েব, মোবাইল ও AI",
  // PNG exports (staticFile paths). Live SVG version: components/LogoMark.tsx.
  logo: "brand/logo-on-dark.png" as string | null,
  logoLight: "brand/logo.png",
  logoWhite: "brand/logo-white.png",
  logoBadge: "brand/logo-badge.png",
  colors: {
    bg: "#0A0F1C", // deep navy (website background)
    surface: "#101726", // cards, panels
    text: "#E9EEF6",
    muted: "#8A97AB",
    accent: "#F5B841", // amber gold: highlights, CTAs, key words
    accent2: "#2BB683", // emerald: secondary highlights, glows
    emerald: "#2BB683", // logo main on dark
    emeraldDeep: "#147A5C", // logo deep part on dark
    brandGreen: "#16805B", // logo main on light
    brandDeep: "#0C4D46", // logo deep part on light
    live: "#4ADE80", // status dot
    youtubeRed: "#FF0033",
    facebookBlue: "#1877F2",
  },
  // Every Bengali family below also contains Latin glyphs, so mixed বাংলা + English text renders in one font.
  fonts: {
    body: "'Hind Siliguri', 'Inter', sans-serif",
    display: "'Anek Bangla', 'Hind Siliguri', sans-serif",
    latin: "'Inter', 'Hind Siliguri', sans-serif",
    rounded: "'Baloo Da 2', 'Hind Siliguri', sans-serif",
    latinDisplay: "'Bebas Neue', 'Anek Bangla', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
};

export type Brand = typeof brand;

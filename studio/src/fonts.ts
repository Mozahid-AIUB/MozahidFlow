import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// loadFont() holds the render (delayRender) until each file is ready, so Bengali text never
// renders in a fallback font. Files live in public/fonts (copied from D:\Video\assets\fonts).
const load = (family: string, file: string, weight: string) =>
  loadFont({ family, url: staticFile(`fonts/${file}`), weight, display: "block" });

const hind: [string, string][] = [
  ["300", "Light"],
  ["400", "Regular"],
  ["500", "Medium"],
  ["600", "SemiBold"],
  ["700", "Bold"],
];
for (const [weight, name] of hind) load("Hind Siliguri", `HindSiliguri-${name}.ttf`, weight);

const poppins: [string, string][] = [
  ["400", "Regular"],
  ["500", "Medium"],
  ["600", "SemiBold"],
  ["700", "Bold"],
  ["800", "ExtraBold"],
  ["900", "Black"],
];
for (const [weight, name] of poppins) load("Poppins", `Poppins-${name}.ttf`, weight);

// Variable fonts: one file covers the whole weight range.
load("Anek Bangla", "AnekBangla-Variable.ttf", "100 800");
load("Noto Sans Bengali", "NotoSansBengali-Variable.ttf", "100 900");
load("Noto Serif Bengali", "NotoSerifBengali-Variable.ttf", "100 900");
load("Baloo Da 2", "BalooDa2-Variable.ttf", "400 800");
load("Inter", "Inter-Variable.ttf", "100 900");
load("Montserrat", "Montserrat-Variable.ttf", "100 900");
load("JetBrains Mono", "JetBrainsMono-Variable.ttf", "100 800");
load("Tiro Bangla", "TiroBangla-Regular.ttf", "400");
load("Galada", "Galada-Regular.ttf", "400");
load("Bebas Neue", "BebasNeue-Regular.ttf", "400");

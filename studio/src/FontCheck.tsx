import { AbsoluteFill } from "remotion";

// Diagnostic: every line falls back to serif, so a font that did not load is obvious.
// Run `npx remotion still FontCheck <out.png>` after changing fonts.ts or package.json sideEffects.
const families = ["Inter", "Hind Siliguri", "Anek Bangla", "Poppins", "Noto Sans Bengali", "Baloo Da 2"];

export const FontCheck: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0F1C", color: "#E9EEF6", padding: 40, fontSize: 52, fontWeight: 600 }}>
    {families.map((f) => (
      <div key={f} style={{ fontFamily: `'${f}', serif`, height: 160 }}>
        {f}: Mozahidul Islam · বাংলা ভিডিও
      </div>
    ))}
  </AbsoluteFill>
);

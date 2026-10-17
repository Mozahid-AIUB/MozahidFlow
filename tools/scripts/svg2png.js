// Render an SVG to a transparent PNG at a given width (height keeps the aspect ratio).
// Uses the Playwright Chromium installed in tools\motion.
//   node tools\scripts\svg2png.js <in.svg> <out.png> <width> [background]
// background: optional CSS colour for previews (default transparent).
const path = require("path");
const fs = require("fs");
const { chromium } = require(path.join(__dirname, "..", "motion", "node_modules", "playwright"));

(async () => {
  const [src, out, widthArg, background] = process.argv.slice(2);
  if (!src || !out || !widthArg) {
    console.error("usage: node svg2png.js <in.svg> <out.png> <width> [background]");
    process.exit(2);
  }
  const svg = fs.readFileSync(src, "utf8");
  const vb = /viewBox="\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)"/.exec(svg);
  if (!vb) throw new Error("SVG needs a viewBox");
  const width = Number(widthArg);
  const height = Math.round((width * Number(vb[2])) / Number(vb[1]));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  const sized = svg.replace(/<svg([^>]*?)\swidth="[^"]*"\s+height="[^"]*"/, "<svg$1").replace("<svg", `<svg width="${width}" height="${height}"`);
  await page.setContent(
    `<html><body style="margin:0;background:${background || "transparent"}">${sized}</body></html>`
  );
  await page.screenshot({ path: out, omitBackground: !background, clip: { x: 0, y: 0, width, height } });
  await browser.close();
  console.log(`${out} ${width}x${height}`);
})();

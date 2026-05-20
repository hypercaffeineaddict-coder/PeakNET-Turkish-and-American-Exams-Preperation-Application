import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");
mkdirSync(publicDir, { recursive: true });

// Mor backgroundlu, içinde "Y" harfli basit SVG ikon (Anthropic'ın brand grafiği değil,
// tamamen sentetik logo). Maskable safe-zone için içerik küçük tutuluyor.
function makeSvg(size, maskable = false) {
  // Maskable için padding daha fazla (safe-zone %80)
  const innerScale = maskable ? 0.55 : 0.7;
  const cx = size / 2;
  const cy = size / 2;
  const inner = size * innerScale;
  const fontSize = inner * 0.65;
  const radius = maskable ? size / 2 : size * 0.22;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>
  <text x="${cx}" y="${cy}" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
        font-weight="800" font-size="${fontSize}"
        text-anchor="middle" dominant-baseline="central"
        fill="white" letter-spacing="-2">Y</text>
</svg>`;
}

// SVG'leri yaz
writeFileSync(resolve(publicDir, "icon.svg"), makeSvg(512));
writeFileSync(resolve(publicDir, "icon-maskable.svg"), makeSvg(512, true));

// Next.js 16, app/icon.png/png auto kabul ediyor ama PWA için public içinde de gerek.
// Pure JS'le PNG üretmek yerine SVG kullanıp icon-XYZ.svg adıyla bırakıyoruz.
// Manifest'i .svg'lere yönlendirelim.
console.log("✔ Icons (SVG) generated.");

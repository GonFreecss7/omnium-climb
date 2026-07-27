// Rasterizes src/assets/icon-source.svg into the PWA/touch icon sizes under public/.
// Dev-time only; re-run with `npm run icons` if the source mark changes.

import sharp from "sharp";
import { mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.resolve(ROOT, "src/assets/icon-source.svg");
const OUT_DIR = path.resolve(ROOT, "public");
const ICONS_DIR = path.resolve(OUT_DIR, "icons");

mkdirSync(ICONS_DIR, { recursive: true });

const targets = [
  { file: "icons/icon-192.png", size: 192 },
  { file: "icons/icon-512.png", size: 512 },
  { file: "icons/maskable-icon-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "favicon-48.png", size: 48 },
];

for (const { file, size } of targets) {
  const outPath = path.resolve(OUT_DIR, file);
  await sharp(SRC).resize(size, size).png().toFile(outPath);
  console.log(`wrote ${path.relative(ROOT, outPath)} (${size}x${size})`);
}

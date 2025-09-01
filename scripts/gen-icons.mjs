import sharp from "sharp";
import fs from "fs";

const sizes = [
  { size: 192, name: "icon-192.png" },
  { size: 512, name: "icon-512.png" },
  { size: 180, name: "apple-touch-icon.png" },
  { size: 512, name: "icon-512-maskable.png", maskable: true }
];

const input = "public/icon-source.svg"; // źródłowy plik SVG
const outDir = "public";

if (!fs.existsSync(input)) {
  console.error(`❌ Brak pliku źródłowego: ${input}`);
  process.exit(1);
}

for (const { size, name } of sizes) {
  const outPath = `${outDir}/${name}`;
  sharp(input)
    .resize(size, size)
    .png()
    .toFile(outPath)
    .then(() => console.log(`✅ Wygenerowano ${outPath}`))
    .catch(err => console.error(`❌ Błąd przy ${name}`, err));
}

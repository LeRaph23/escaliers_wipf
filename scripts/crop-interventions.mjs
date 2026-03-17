import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const src = path.join(publicDir, "interventions-grid.png");
const meta = await sharp(src).metadata();
const { width, height } = meta;

// Grille 4×3 avec gouttières (gaps) entre les cellules — recadrage net sur chaque photo.
const gap = 8;
const cellW = Math.floor((width - 3 * gap) / 4);   // 4 cellules, 3 gaps en largeur
const cellH = Math.floor((height - 2 * gap) / 3);   // 3 lignes, 2 gaps en hauteur

function left(col) {
  return col * (cellW + gap);
}
function top(row) {
  return row * (cellH + gap);
}

const mapping = [
  { name: "depannage", col: 0, row: 0 },
  { name: "mise-aux-normes", col: 1, row: 0 },
  { name: "renovation", col: 3, row: 0 },
  { name: "eclairage", col: 0, row: 1 },
  { name: "chauffage", col: 1, row: 1 },
  { name: "climatisation", col: 2, row: 1 },
  { name: "maison-connectee", col: 3, row: 1 },
  { name: "parlophonie", col: 0, row: 2 },
  { name: "securite", col: 1, row: 2 },
  { name: "informatique", col: 2, row: 2 },
];

for (const { name, col, row } of mapping) {
  const x = left(col);
  const y = top(row);
  await sharp(src)
    .extract({ left: x, top: y, width: cellW, height: cellH })
    .jpeg({ quality: 88 })
    .toFile(path.join(publicDir, `intervention-${name}.jpg`));
}

console.log("10 images créées (grille avec gap 8px, cellW=%d cellH=%d)", cellW, cellH);

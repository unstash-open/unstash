import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outputDirectory = process.argv[2];

if (!outputDirectory) {
  throw new Error("usage: render-demo-captions.mjs OUTPUT_DIRECTORY");
}

const captions = [
  ["Saved posts feel useful —", "until they vanish into a pile."],
  [
    "Unstash turns your Reddit saved-post CSV",
    "into a private action queue, right in your browser.",
  ],
  ["No login. No OAuth. No upload.", "Your data stays with you."],
  [
    "Pick what happens next: read it, make it,",
    "keep it, or finish it.",
    "Then export to Markdown.",
  ],
  [
    "The CSV importer is live.",
    "Next up: a lightweight browser extension.",
  ],
  ["Open source. Private by default.", "Ready when you are."],
];

await fs.mkdir(outputDirectory, { recursive: true });

for (const [index, lines] of captions.entries()) {
  const twoLines = lines.length === 2;
  const boxY = twoLines ? 590 : 610;
  const boxHeight = twoLines ? 98 : 72;
  const firstLineY = twoLines ? 628 : 655;
  const tspans = lines
    .map(
      (line, lineIndex) =>
        `<tspan x="640" y="${firstLineY + lineIndex * 34}">${line}</tspan>`,
    )
    .join("");
  const svg = `
    <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
      <rect x="60" y="${boxY}" width="1160" height="${boxHeight}" rx="16"
        fill="#111111" fill-opacity="0.88"/>
      <text x="640" y="${firstLineY}" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="28"
        font-weight="700" fill="#ffffff">${tspans}</text>
    </svg>
  `;

  await sharp(Buffer.from(svg)).png().toFile(
    path.join(
      outputDirectory,
      `caption-${String(index + 1).padStart(2, "0")}.png`,
    ),
  );
}

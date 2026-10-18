import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { ALL_CARDS } from '../src/data/cards';
import { generateCardSvg } from '../src/lib/art/cardArtGenerator';

async function main() {
  const cardsDir = path.resolve(process.cwd(), 'public/cards');
  if (!fs.existsSync(cardsDir)) {
    fs.mkdirSync(cardsDir, { recursive: true });
  }

  const existingFiles = new Set(fs.readdirSync(cardsDir));
  console.log(`Found ${existingFiles.size} existing files in public/cards/`);

  let renderedCount = 0;
  let skippedCount = 0;

  for (const card of ALL_CARDS) {
    const fileName = `${card.id}.jpg`;
    const targetPath = path.join(cardsDir, fileName);

    // If file already exists and is not a 0-byte file, keep it (especially the 11 AI images!)
    if (existingFiles.has(fileName)) {
      const stat = fs.statSync(targetPath);
      if (stat.size > 20000) {
        console.log(`[Keep Existing] ${card.id} (${(stat.size / 1024).toFixed(1)} KB) - ${card.name}`);
        skippedCount++;
        continue;
      }
    }

    // Generate high-resolution SVG and rasterize to JPEG
    const svg = generateCardSvg(card);
    const jpegBuffer = await sharp(Buffer.from(svg))
      .resize(800, 1120)
      .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
      .toBuffer();

    fs.writeFileSync(targetPath, jpegBuffer);
    console.log(`[Rendered Raster] ${card.id} (${(jpegBuffer.length / 1024).toFixed(1)} KB) - ${card.name}`);
    renderedCount++;
  }

  console.log(`\n========================================`);
  console.log(`Total Cards: ${ALL_CARDS.length}`);
  console.log(`Kept Existing (AI Paintings): ${skippedCount}`);
  console.log(`Newly Rendered Raster Images: ${renderedCount}`);
  console.log(`Total Images on Disk: ${fs.readdirSync(cardsDir).filter(f => f.endsWith('.jpg')).length}`);
  console.log(`========================================\n`);
}

main().catch(err => {
  console.error('Error generating card images:', err);
  process.exit(1);
});

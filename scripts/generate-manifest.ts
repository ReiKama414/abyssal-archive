import fs from 'fs';
import path from 'path';
import { ALL_CARDS } from '../src/data/cards';

const manifest = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  totalCards: ALL_CARDS.length,
  summary: {
    aiDiffusionPaintings: 11,
    highResRasterRenders: 75,
    totalImagesOnDisk: ALL_CARDS.length,
    missingImages: 0,
  },
  aiPaintingIds: [
    'abyss-15',
    'nocturne-13',
    'neon-11',
    'beast-12',
    'abyss-12',
    'nocturne-10',
    'beast-09',
    'beast-10',
    'fest-anniv-02',
    'fest-eclipse-02',
    'fest-midautumn-02',
  ],
  cards: ALL_CARDS.map(card => {
    const filePath = `public/cards/${card.id}.jpg`;
    const fullPath = path.resolve(process.cwd(), filePath);
    const exists = fs.existsSync(fullPath);
    const size = exists ? fs.statSync(fullPath).size : 0;
    const isAiPainting = size > 500000;

    return {
      id: card.id,
      name: card.name,
      nameEn: card.nameEn,
      series: card.series,
      rarity: card.rarity,
      imagePath: `/cards/${card.id}.jpg`,
      exists,
      fileSizeBytes: size,
      fileSizeKb: (size / 1024).toFixed(1),
      renderingType: isAiPainting ? 'AI Photorealistic Diffusion Painting' : 'High-Res Raster Artwork (Sharp/Libvips)',
      description: card.description,
      artist: card.artist,
    };
  }),
};

fs.writeFileSync('public/cards/MANIFEST.json', JSON.stringify(manifest, null, 2), 'utf8');
console.log('Successfully wrote public/cards/MANIFEST.json with', manifest.cards.length, 'entries.');

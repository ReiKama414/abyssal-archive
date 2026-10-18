import fs from 'fs';
import path from 'path';
import { ALL_CARDS } from '../src/data/cards';

console.log('Total cards:', ALL_CARDS.length);
const withoutImg = ALL_CARDS.filter(c => !c.customImageUrl);
console.log('Cards without customImageUrl:', withoutImg.length);

const missingFiles: string[] = [];
for (const card of ALL_CARDS) {
  const filePath = path.join(process.cwd(), 'public', card.customImageUrl?.replace(/^\//, '') || '');
  if (!fs.existsSync(filePath)) {
    missingFiles.push(`${card.id} -> ${card.customImageUrl}`);
  }
}

console.log('Missing files on disk:', missingFiles.length);
if (missingFiles.length > 0) {
  console.log('Sample missing:', missingFiles.slice(0, 5));
}

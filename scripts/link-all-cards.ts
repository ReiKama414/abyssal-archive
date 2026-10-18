import fs from 'fs';
import path from 'path';

const cardsPath = path.resolve(process.cwd(), 'src/data/cards.ts');
const code = fs.readFileSync(cardsPath, 'utf8');

// Regex matches each card object: { id: '...', ... }
// We want to ensure each card has customImageUrl: '/cards/{id}.jpg'
const cardRegex = /{\s*id:\s*'([a-zA-Z0-9_-]+)'([\s\S]*?)\n\s*},/g;

let matchCount = 0;
let updatedCount = 0;

const updated = code.replace(cardRegex, (fullMatch, id, body) => {
  matchCount++;
  if (body.includes('customImageUrl')) {
    return fullMatch;
  }
  // Insert customImageUrl right before visualSeed or palette
  let newBody = body;
  if (newBody.includes('visualSeed:')) {
    newBody = newBody.replace(/(visualSeed:\s*'[^']+',)/, `customImageUrl: '/cards/${id}.jpg',\n    $1`);
  } else if (newBody.includes('palette:')) {
    newBody = newBody.replace(/(palette:\s*\{)/, `customImageUrl: '/cards/${id}.jpg',\n    $1`);
  } else {
    newBody += `\n    customImageUrl: '/cards/${id}.jpg',`;
  }
  updatedCount++;
  return `{\n    id: '${id}'${newBody}\n  },`;
});

fs.writeFileSync(cardsPath, updated, 'utf8');

const finalCount = (updated.match(/customImageUrl:\s*'\/cards\//g) || []).length;
console.log(`Matched cards: ${matchCount}`);
console.log(`Updated cards: ${updatedCount}`);
console.log(`Final total cards with customImageUrl: ${finalCount}`);

import fs from 'fs';
import { ALL_CARDS } from '../src/data/cards.js';

/**
 * Script documenting prompts and generation parameters for all 86 cards
 * for re-generation once Gemini Imagen quota resets (4h44m) or with custom API keys.
 */
export function buildCardPrompt(card) {
  let styleHint = '';
  if (card.series === 'abyssal-jellyfish') {
    styleHint = 'bioluminescent deep sea photography, underwater caustics, abyssal trench darkness, translucent glowing tentacles, mystical runes, 8k resolution fantasy art';
  } else if (card.series === 'nocturne-fantasy') {
    styleHint = 'dark gothic anime fantasy masterpiece, stained glass moonlit cathedral, roses, ornate gothic attire, glowing magical circles, hyper-detailed character art';
  } else if (card.series === 'neon-district') {
    styleHint = 'cyberpunk anime illustration, neon-soaked rain city at night, cyan and magenta holographic HUD, fiber optic wires, futuristic chrome details';
  } else if (card.series === 'phantom-beasts') {
    styleHint = 'oriental celestial myth fantasy concept art, sacred spiritual flames, divine clouds, celestial runes, majestic mythological beast painting';
  } else {
    styleHint = 'limited festival holiday celebration fantasy illustration, commemorative celestial ornaments, vibrant particle fireworks, masterpiece trading card';
  }

  return `Masterpiece digital trading card art of ${card.name} (${card.nameEn}): ${card.description} ${styleHint}. Distinct, gorgeous character and creature focus. Aspect ratio 3:4.`;
}

const promptCatalog = ALL_CARDS.map(c => ({
  id: c.id,
  name: c.name,
  nameEn: c.nameEn,
  series: c.series,
  rarity: c.rarity,
  imageTarget: `public/cards/${c.id}.jpg`,
  prompt: buildCardPrompt(c)
}));

fs.writeFileSync('scripts/prompts-catalog.json', JSON.stringify(promptCatalog, null, 2), 'utf8');
console.log(`Generated prompt catalog for all ${promptCatalog.length} cards in scripts/prompts-catalog.json.`);

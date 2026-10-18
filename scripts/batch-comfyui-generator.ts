import fs from 'fs';
import path from 'path';
import { ALL_CARDS } from '../src/data/cards';
import { CardDefinition } from '../src/types';

const COMFY_URL = 'http://127.0.0.1:8188';

// Map of card themes to optimized English visual prompts for Illustrious-XL
function generatePromptForCard(card: CardDefinition): string {
  const basePrefix = 'masterpiece, best quality, ultra-detailed, anime fantasy aesthetic, vibrant colors, cinematic lighting';
  let specificPrompt = '';

  // Series-specific atmosphere
  let environment = '';
  if (card.series === 'abyssal-jellyfish') {
    environment = 'underwater deep sea abyss, glowing bioluminescence, floating luminous plankton, dark ocean trench, volumetric caustics';
  } else if (card.series === 'nocturne-fantasy') {
    environment = 'dark gothic fantasy, moonlit cathedral, roses, glowing magic circles, dark fantasy atmosphere';
  } else if (card.series === 'neon-district') {
    environment = 'cyberpunk metropolis at night, rain-soaked neon street, holographic signs, cyan and magenta glow, futuristic city';
  } else if (card.series === 'phantom-beasts') {
    environment = 'mythical oriental fantasy, glowing spirit flames, celestial clouds, sacred starlight, ethereal beast realm';
  } else {
    // Festival series
    environment = `magical celebration festival, sparkling stardust particles, grand fantasy commemoration`;
  }

  // Card specific prompt building based on nameEn, tags, and character type
  const tagsStr = (card.tags || []).join(', ');
  specificPrompt = `${card.nameEn}, ${tagsStr}, ${card.description}`;

  return `${basePrefix}, ${specificPrompt}, ${environment}, highly detailed anime concept art, official trading card game illustration`;
}

async function queuePrompt(card: CardDefinition, clientId: string) {
  const positivePrompt = generatePromptForCard(card);
  const negativePrompt = 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, draft';

  const promptWorkflow = {
    "3": {
      "inputs": {
        "seed": Math.floor(Math.random() * 1000000000),
        "steps": 20,
        "cfg": 5.5,
        "sampler_name": "euler",
        "scheduler": "normal",
        "denoise": 1,
        "model": ["4", 0],
        "positive": ["6", 0],
        "negative": ["7", 0],
        "latent_image": ["5", 0]
      },
      "class_type": "KSampler"
    },
    "4": {
      "inputs": {
        "ckpt_name": "Illustrious-XL-v2.0.safetensors"
      },
      "class_type": "CheckpointLoaderSimple"
    },
    "5": {
      "inputs": {
        "width": 768,
        "height": 1088,
        "batch_size": 1
      },
      "class_type": "EmptyLatentImage"
    },
    "6": {
      "inputs": {
        "text": positivePrompt,
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "7": {
      "inputs": {
        "text": negativePrompt,
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "8": {
      "inputs": {
        "samples": ["3", 0],
        "vae": ["4", 2]
      },
      "class_type": "VAEDecode"
    },
    "9": {
      "inputs": {
        "filename_prefix": `card_${card.id}`,
        "images": ["8", 0]
      },
      "class_type": "SaveImage"
    }
  };

  const res = await fetch(`${COMFY_URL}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: promptWorkflow, client_id: clientId })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Queue failed for ${card.id}: ${errText}`);
  }

  const data = await res.json();
  return data.prompt_id as string;
}

async function waitForPrompt(promptId: string): Promise<{ filename: string; subfolder: string; type: string }> {
  for (let i = 0; i < 90; i++) {
    await new Promise(r => setTimeout(r, 600));
    const histRes = await fetch(`${COMFY_URL}/history/${promptId}`);
    if (histRes.ok) {
      const histData = await histRes.json();
      if (histData[promptId]?.outputs?.["9"]?.images?.[0]) {
        return histData[promptId].outputs["9"].images[0];
      }
    }
  }
  throw new Error(`Timeout waiting for prompt ${promptId}`);
}

async function saveImage(imgInfo: { filename: string; subfolder: string; type: string }, targetFile: string) {
  const viewUrl = `${COMFY_URL}/view?filename=${encodeURIComponent(imgInfo.filename)}&subfolder=${encodeURIComponent(imgInfo.subfolder)}&type=${encodeURIComponent(imgInfo.type)}`;
  const imgRes = await fetch(viewUrl);
  if (!imgRes.ok) throw new Error(`Failed to fetch image: ${viewUrl}`);

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(targetFile, buffer);
  return buffer.length;
}

async function main() {
  const cardsDir = path.resolve(process.cwd(), 'public/cards');
  const clientId = 'batch_gen_' + Math.random().toString(36).substring(7);

  // Cards that already have high-end AI paintings from previous batch (size > 400KB)
  const toGenerate: CardDefinition[] = [];
  for (const card of ALL_CARDS) {
    const filePath = path.join(cardsDir, `${card.id}.jpg`);
    if (fs.existsSync(filePath)) {
      const size = fs.statSync(filePath).size;
      // Skip if already an AI-generated image (> 400KB)
      if (size > 400000) {
        continue;
      }
    }
    toGenerate.push(card);
  }

  console.log(`\n======================================================`);
  console.log(`ComfyUI Batch Card Generator`);
  console.log(`Target: ${toGenerate.length} cards remaining to generate via Illustrious-XL`);
  console.log(`======================================================\n`);

  let count = 0;
  for (const card of toGenerate) {
    count++;
    const startTime = Date.now();
    process.stdout.write(`[${count}/${toGenerate.length}] Generating ${card.id} (${card.name} / ${card.nameEn})... `);

    try {
      const promptId = await queuePrompt(card, clientId);
      const imgInfo = await waitForPrompt(promptId);
      const targetPath = path.join(cardsDir, `${card.id}.jpg`);
      const bytes = await saveImage(imgInfo, targetPath);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✓ DONE (${duration}s, ${(bytes / 1024).toFixed(1)} KB)`);
    } catch (err: unknown) {
      console.log(`✗ FAILED: ${(err as Error)?.message || err}`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`Batch Generation Finished! Generated ${count} cards.`);
  console.log(`======================================================\n`);
}

main().catch(err => {
  console.error('Fatal error in batch generator:', err);
  process.exit(1);
});

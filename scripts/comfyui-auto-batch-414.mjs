import fs from 'fs';
import path from 'path';

const COMFY_URL = 'http://127.0.0.1:8188';
const CARDS_DIR = path.resolve('public/cards');
const PROGRESS_FILE = path.join(CARDS_DIR, 'GENERATION_PROGRESS.json');

// Helper to create tailored English prompts for any card
function buildCardEnglishPrompt(card) {
  const nameEn = (card.nameEn || '')
    .replace(/^EX\s*\/\/\s*/i, '')
    .replace(/#\d+/g, '')
    .trim();

  let subject = nameEn;
  let atmosphere = '';

  switch (card.series) {
    case 'abyssal-jellyfish':
      atmosphere = 'bioluminescent glowing tentacles, deep ocean abyss, underwater volumetric caustics, floating cyan plankton, dark ocean trench, oceanic mythical creature';
      break;
    case 'nocturne-fantasy':
      atmosphere = 'dark gothic anime fantasy, ornate gothic clothing, stained glass cathedral, moonlit midnight, mystical magic circles, glowing violet and red particle wisps, highly detailed anime illustration';
      break;
    case 'neon-district':
      atmosphere = 'cyberpunk 2077 anime aesthetic, futuristic neon city at night, rain-slicked asphalt reflections, glowing cyan and magenta neon signs, holographic HUD interface, high-tech cybernetics';
      break;
    case 'phantom-beasts':
      atmosphere = 'ethereal mythical spirit animal beast, glowing spirit flame auras, celestial starry sky, glowing runic mist, fantasy creature art, vibrant colors';
      break;
    case 'halloween':
      atmosphere = 'gothic anime halloween fantasy, jack-o-lantern carved pumpkins, floating ghost spirits, dark autumn night, full orange moon, bats, witch hat';
      break;
    case 'christmas':
      atmosphere = 'magical anime christmas winter wonderland, softly falling snow, frosted pine branches, warm glowing festive lantern lights, holiday golden ribbons';
      break;
    case 'new-year':
      atmosphere = 'sacred Japanese new year shrine celebration, dawn golden sunlight, traditional ornate kimono, red torii gate, floating sakura petals, golden shimmer';
      break;
    case 'valentines':
      atmosphere = 'romantic anime gothic fantasy, fluttering red and pink rose petals, glowing ruby heart gemstone, lace ribbons, moonlit romantic atmosphere';
      break;
    case 'sakura-festival':
      atmosphere = 'traditional Japanese anime fantasy, weeping cherry blossom sakura trees, swirling pink blossom petals, spring breeze, lantern lit river';
      break;
    case 'summer-festival':
      atmosphere = 'Japanese summer matsuri festival night, vibrant fireworks bursting in night sky, paper lantern stalls, summer yukata, goldfish lantern';
      break;
    case 'mid-autumn':
      atmosphere = 'celestial mid-autumn harvest moon festival, enormous glowing silver full moon, jade rabbit spirit, fragrant osmanthus blossoms, golden celestial mist';
      break;
    case 'anniversary':
      atmosphere = 'grand imperial archive celebration, golden cathedral hall, crystal chandeliers, flying gold foil confetti, velvet banners, royal crown';
      break;
    case 'abyss-eclipse':
      atmosphere = 'total solar eclipse cosmic corona, dark black sun, dark void purple corona, cosmic void nebula rift, floating abyssal runes';
      break;
    default:
      atmosphere = 'high fantasy trading card illustration, vibrant colors, cinematic volumetric lighting';
  }

  return `masterpiece, best quality, ultra-detailed, official trading card game art, ${subject}, ${atmosphere}, 8k resolution, cinematic lighting, sharp focus`;
}

async function queueComfyUIPrompt(cardId, promptText) {
  const negativePrompt = 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, draft';

  const promptWorkflow = {
    "3": {
      "inputs": {
        "seed": Math.floor(Math.random() * 1000000000),
        "steps": 16,
        "cfg": 5.0,
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
        "text": promptText,
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
        "filename_prefix": `card_${cardId}`,
        "images": ["8", 0]
      },
      "class_type": "SaveImage"
    }
  };

  const res = await fetch(`${COMFY_URL}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: promptWorkflow })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Queue failed for ${cardId}: ${errText}`);
  }

  const data = await res.json();
  return data.prompt_id;
}

async function waitForPromptCompletion(promptId) {
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 500));
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

async function downloadAndSaveImage(imgInfo, targetFile) {
  const viewUrl = `${COMFY_URL}/view?filename=${encodeURIComponent(imgInfo.filename)}&subfolder=${encodeURIComponent(imgInfo.subfolder)}&type=${encodeURIComponent(imgInfo.type)}`;
  const imgRes = await fetch(viewUrl);
  if (!imgRes.ok) throw new Error(`Failed to download image from ${viewUrl}`);

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(targetFile, buffer);
  return buffer.length;
}

async function main() {
  console.log('======================================================');
  console.log('   ABYSSAL ARCHIVE — ComfyUI 414 全卡自動批次生成引擎');
  console.log('======================================================\n');

  // Verify ComfyUI connection
  try {
    const statsRes = await fetch(`${COMFY_URL}/system_stats`);
    if (!statsRes.ok) throw new Error('Status not 200');
    console.log('[ComfyUI] 成功連線至本機 ComfyUI (127.0.0.1:8188)');
  } catch {
    console.error('[Error] 無法連接至 ComfyUI (127.0.0.1:8188)，請確認 ComfyUI 已啟動！');
    process.exit(1);
  }

  // Load manifest
  const manifestPath = path.join(CARDS_DIR, 'MANIFEST.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('[Error] 找不到 MANIFEST.json！');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const allCards = manifest.cards || [];

  // Filter cards that still need generation:
  // Files with size <= 400KB (raster SVGs) or missing files
  const needGeneration = allCards.filter((card) => {
    const filePath = path.join(CARDS_DIR, `${card.id}.jpg`);
    if (!fs.existsSync(filePath)) return true;
    const stat = fs.statSync(filePath);
    return stat.size <= 400000; // Raster SVGs are <= 400KB
  });

  const alreadyAIPaintings = allCards.length - needGeneration.length;

  console.log(`總卡牌數量: ${allCards.length}`);
  console.log(`已完成 AI 插畫 (保留): ${alreadyAIPaintings} 張`);
  console.log(`待生成 AI 插畫: ${needGeneration.length} 張\n`);

  if (needGeneration.length === 0) {
    console.log('🎉 全部 414 張卡牌皆已具備高畫質 AI 插畫！');
    process.exit(0);
  }

  let successCount = 0;
  let failCount = 0;

  for (let idx = 0; idx < needGeneration.length; idx++) {
    const card = needGeneration[idx];
    const targetFile = path.join(CARDS_DIR, `${card.id}.jpg`);
    const prompt = buildCardEnglishPrompt(card);
    const startTime = Date.now();

    const currentTotalDone = alreadyAIPaintings + successCount;
    const progressPercent = ((currentTotalDone / allCards.length) * 100).toFixed(1);

    process.stdout.write(
      `[${idx + 1}/${needGeneration.length}] (總進度: ${currentTotalDone}/${allCards.length} · ${progressPercent}%) 生成 ${card.id} (${card.name} / ${card.nameEn})... `
    );

    // Save progress status to JSON file
    fs.writeFileSync(
      PROGRESS_FILE,
      JSON.stringify(
        {
          total: allCards.length,
          aiCompleted: currentTotalDone,
          remaining: needGeneration.length - idx,
          currentCard: {
            id: card.id,
            name: card.name,
            nameEn: card.nameEn,
            series: card.series,
            rarity: card.rarity,
          },
          percent: `${progressPercent}%`,
          lastUpdated: new Date().toISOString(),
          status: 'running',
        },
        null,
        2
      )
    );

    try {
      const promptId = await queueComfyUIPrompt(card.id, prompt);
      const imgInfo = await waitForPromptCompletion(promptId);
      const bytes = await downloadAndSaveImage(imgInfo, targetFile);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✓ 完成 (${duration}s, ${(bytes / 1024).toFixed(1)} KB)`);
      successCount++;
    } catch (err) {
      console.log(`✗ 失敗: ${err.message || err}`);
      failCount++;
    }
  }

  // Final update to progress file
  fs.writeFileSync(
    PROGRESS_FILE,
    JSON.stringify(
      {
        total: allCards.length,
        aiCompleted: alreadyAIPaintings + successCount,
        remaining: 0,
        currentCard: null,
        percent: '100.0%',
        lastUpdated: new Date().toISOString(),
        status: 'completed',
      },
      null,
      2
    )
  );

  console.log('\n======================================================');
  console.log(`批次生成結束！成功: ${successCount} 張，失敗: ${failCount} 張`);
  console.log(`目前全庫 AI 插畫總數: ${alreadyAIPaintings + successCount} / ${allCards.length}`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Fatal batch generator error:', err);
  process.exit(1);
});

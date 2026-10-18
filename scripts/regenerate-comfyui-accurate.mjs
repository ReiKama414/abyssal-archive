import fs from 'fs';
import path from 'path';

const COMFY_URL = 'http://127.0.0.1:8188';
const CARDS_DIR = path.resolve('public/cards');
const PROGRESS_FILE = path.join(CARDS_DIR, 'GENERATION_PROGRESS.json');
const ACCURATE_PROMPTS_FILE = path.resolve('scripts/accurate-prompts.json');

if (!fs.existsSync(ACCURATE_PROMPTS_FILE)) {
  console.error(`[Error] 找不到 ${ACCURATE_PROMPTS_FILE}`);
  process.exit(1);
}

const accurateCatalog = JSON.parse(fs.readFileSync(ACCURATE_PROMPTS_FILE, 'utf8'));

// Build prompt workflow for ComfyUI (Illustrious-XL-v2.0)
function buildWorkflow(promptText, cardId) {
  const negativePrompt = 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, draft';

  return {
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
        "filename_prefix": `accurate_${cardId}`,
        "images": ["8", 0]
      },
      "class_type": "SaveImage"
    }
  };
}

async function queueComfyUIPrompt(cardId, promptText) {
  const workflow = buildWorkflow(promptText, cardId);

  const res = await fetch(`${COMFY_URL}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Queue failed for ${cardId}: ${errText}`);
  }

  const data = await res.json();
  return data.prompt_id;
}

async function waitForPromptCompletion(promptId) {
  for (let i = 0; i < 180; i++) {
    await new Promise((r) => setTimeout(r, 600));
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
  const viewUrl = `${COMFY_URL}/view?filename=${encodeURIComponent(imgInfo.filename)}&subfolder=${encodeURIComponent(imgInfo.subfolder || '')}&type=${encodeURIComponent(imgInfo.type || 'output')}`;
  const imgRes = await fetch(viewUrl);
  if (!imgRes.ok) throw new Error(`Failed to download image from ${viewUrl}`);

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(targetFile, buffer);
  return buffer.length;
}

export async function generateSingleCard(cardId) {
  const cardData = accurateCatalog[cardId];
  if (!cardData) throw new Error(`Card ${cardId} not found in accurateCatalog`);

  const targetFile = path.join(CARDS_DIR, `${cardId}.jpg`);
  const promptId = await queueComfyUIPrompt(cardId, cardData.prompt);
  const imgInfo = await waitForPromptCompletion(promptId);
  const size = await downloadAndSaveImage(imgInfo, targetFile);
  return { cardId, size, prompt: cardData.prompt };
}

// CLI Mode
async function main() {
  const args = process.argv.slice(2);
  const targetId = args[0]; // e.g., 'fest-halloween-10' or 'batch' or specific series

  console.log('======================================================');
  console.log('   ABYSSAL ARCHIVE — 精準中翻英 ComfyUI 重生引擎');
  console.log('======================================================\n');

  // Verify connection
  try {
    const statsRes = await fetch(`${COMFY_URL}/system_stats`);
    if (!statsRes.ok) throw new Error('Status not 200');
    console.log('[ComfyUI] 成功連線至本機 ComfyUI (127.0.0.1:8188)');
  } catch {
    console.error('[Error] 無法連接至 ComfyUI (127.0.0.1:8188)，請確認 ComfyUI 已啟動！');
    process.exit(1);
  }

  const validBatchTargets = ['festivals', 'abyss-later', 'nocturne-later', 'neon-later', 'beast-later', 'all-later', 'batch'];
  if (targetId && !validBatchTargets.includes(targetId) && !targetId.startsWith('series:')) {
    // Single card test mode
    console.log(`[Single Mode] 開始精準生成單張卡牌: ${targetId}`);
    const cardData = accurateCatalog[targetId];
    if (!cardData) {
      console.error(`找不到卡牌 ${targetId}`);
      process.exit(1);
    }
    console.log(`卡牌名稱: ${cardData.name} (${cardData.nameEn})`);
    console.log(`精準英文 Prompt: ${cardData.prompt}\n`);

    const start = Date.now();
    const result = await generateSingleCard(targetId);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`🎉 成功生成 ${targetId}! 大小: ${(result.size / 1024).toFixed(1)} KB，耗時: ${elapsed} 秒`);
    process.exit(0);
  }

  // Determine target cards based on args
  let targetCards = [];

  if (targetId === 'festivals') {
    targetCards = Object.values(accurateCatalog).filter(c => 
      c.id.startsWith('fest-') && parseInt(c.id.split('-').pop(), 10) >= 4
    );
    console.log(`[Target: Festivals Later Batches] 共 ${targetCards.length} 張節日卡牌`);
  } else if (targetId === 'abyss-later') {
    targetCards = Object.values(accurateCatalog).filter(c => 
      c.id.startsWith('abyss-') && parseInt(c.id.replace('abyss-', ''), 10) >= 19
    );
    console.log(`[Target: Abyss Later Batch] 共 ${targetCards.length} 張深海水族卡牌`);
  } else if (targetId === 'nocturne-later') {
    targetCards = Object.values(accurateCatalog).filter(c => 
      c.id.startsWith('nocturne-') && parseInt(c.id.replace('nocturne-', ''), 10) >= 18
    );
    console.log(`[Target: Nocturne Later Batch] 共 ${targetCards.length} 張幽夜幻想卡牌`);
  } else if (targetId === 'neon-later') {
    targetCards = Object.values(accurateCatalog).filter(c => 
      c.id.startsWith('neon-') && parseInt(c.id.replace('neon-', ''), 10) >= 15
    );
    console.log(`[Target: Neon Later Batch] 共 ${targetCards.length} 張霓虹異區卡牌`);
  } else if (targetId === 'beast-later') {
    targetCards = Object.values(accurateCatalog).filter(c => 
      c.id.startsWith('beast-') && parseInt(c.id.replace('beast-', ''), 10) >= 17
    );
    console.log(`[Target: Beast Later Batch] 共 ${targetCards.length} 張幻境靈獸卡牌`);
  } else if (targetId === 'all-later') {
    targetCards = Object.values(accurateCatalog).filter(c => {
      if (c.id.startsWith('abyss-')) return parseInt(c.id.replace('abyss-', ''), 10) >= 19;
      if (c.id.startsWith('nocturne-')) return parseInt(c.id.replace('nocturne-', ''), 10) >= 18;
      if (c.id.startsWith('neon-')) return parseInt(c.id.replace('neon-', ''), 10) >= 15;
      if (c.id.startsWith('beast-')) return parseInt(c.id.replace('beast-', ''), 10) >= 17;
      if (c.id.startsWith('fest-')) return parseInt(c.id.split('-').pop(), 10) >= 4;
      return false;
    });
    console.log(`[Target: All Later Batches] 共 ${targetCards.length} 張待重製卡牌`);
  } else if (targetId && targetId.startsWith('series:')) {
    const seriesFilter = targetId.replace('series:', '');
    targetCards = Object.values(accurateCatalog).filter(c => c.series === seriesFilter);
    console.log(`[Batch Mode] 目標系列: ${seriesFilter} (${targetCards.length} 張)`);
  } else {
    // All cards in accurate catalog
    targetCards = Object.values(accurateCatalog);
    console.log(`[Batch Mode] 全卡牌精準覆蓋 (${targetCards.length} 張)`);
  }

  let successCount = 0;
  let failCount = 0;

  for (let idx = 0; idx < targetCards.length; idx++) {
    const card = targetCards[idx];
    const targetFile = path.join(CARDS_DIR, `${card.id}.jpg`);
    const prompt = card.prompt;
    const startTime = Date.now();

    const progressPercent = (((idx + 1) / targetCards.length) * 100).toFixed(1);
    process.stdout.write(
      `[${idx + 1}/${targetCards.length}] (${progressPercent}%) 生成 ${card.id} [${card.name}]... `
    );

    // Save progress status to JSON file
    fs.writeFileSync(
      PROGRESS_FILE,
      JSON.stringify(
        {
          total: targetCards.length,
          completed: idx,
          remaining: targetCards.length - idx,
          currentCard: {
            id: card.id,
            name: card.name,
            nameEn: card.nameEn,
            series: card.series,
            rarity: card.rarity,
            promptUsed: prompt
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
      const sizeBytes = await downloadAndSaveImage(imgInfo, targetFile);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const sizeKB = (sizeBytes / 1024).toFixed(1);

      console.log(`OK (${elapsed}s, ${sizeKB}KB)`);
      successCount++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failCount++;
    }
  }

  console.log('\n======================================================');
  console.log(`生成完畢！成功: ${successCount} 張，失敗: ${failCount} 張`);
  console.log('======================================================');

  fs.writeFileSync(
    PROGRESS_FILE,
    JSON.stringify(
      {
        total: targetCards.length,
        completed: successCount,
        remaining: failCount,
        status: 'completed',
        lastUpdated: new Date().toISOString(),
      },
      null,
      2
    )
  );
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

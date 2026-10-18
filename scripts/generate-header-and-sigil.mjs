import fs from 'fs';
import path from 'path';

const COMFY_URL = 'http://127.0.0.1:8188';
const PUBLIC_DIR = path.resolve('public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function buildWorkflow({ promptText, negativePrompt, width, height, seed, filenamePrefix }) {
  return {
    "3": {
      "inputs": {
        "seed": seed || Math.floor(Math.random() * 1000000000),
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
        "width": width,
        "height": height,
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
        "filename_prefix": filenamePrefix,
        "images": ["8", 0]
      },
      "class_type": "SaveImage"
    }
  };
}

async function queueWorkflow(workflow) {
  const res = await fetch(`${COMFY_URL}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Queue failed: ${err}`);
  }

  const data = await res.json();
  return data.prompt_id;
}

async function waitForCompletion(promptId) {
  for (let i = 0; i < 200; i++) {
    await new Promise((r) => setTimeout(r, 800));
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

async function downloadImage(imgInfo, targetPaths) {
  const viewUrl = `${COMFY_URL}/view?filename=${encodeURIComponent(imgInfo.filename)}&subfolder=${encodeURIComponent(imgInfo.subfolder || '')}&type=${encodeURIComponent(imgInfo.type || 'output')}`;
  const res = await fetch(viewUrl);
  if (!res.ok) throw new Error(`Download failed from ${viewUrl}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  for (const targetPath of targetPaths) {
    fs.writeFileSync(targetPath, buffer);
  }
  return buffer.length;
}

async function run() {
  console.log('====================================================');
  console.log('  ABYSSAL ARCHIVE — ComfyUI 專屬 Sigil 圖標與 Header 視覺生成');
  console.log('====================================================\n');

  // 1. Generate Bespoke Abyssal Sigil Icon (replacing generic sparkles)
  console.log('>>> [1/2] 正在生成深淵神秘印記圖標 (Abyssal Sigil Icon，取代閃光 icon)...');
  const sigilWorkflow = buildWorkflow({
    promptText: 'masterpiece, best quality, ultra-detailed, game ui icon, sacred abyssal oceanic sigil, glowing cyan bioluminescent jewel emblem, dark navy circular medallion, ancient glowing marine rune, golden filigree rim, clean dark obsidian background, vector game icon, sharp detailing, mystical ocean crest, centered composition',
    negativePrompt: 'lowres, text, watermark, signature, blurry, deformed, human, face, messy, sparkle stars, emojis, cartoon',
    width: 768,
    height: 768,
    seed: 456789123,
    filenamePrefix: 'abyssal_sigil_icon'
  });

  const sigilPromptId = await queueWorkflow(sigilWorkflow);
  console.log(`  -> 已提交至 ComfyUI (ID: ${sigilPromptId})，正在生成中...`);
  const sigilImgInfo = await waitForCompletion(sigilPromptId);
  const sigilSize = await downloadImage(sigilImgInfo, [
    path.join(PUBLIC_DIR, 'sigil.png'),
    path.join(IMAGES_DIR, 'sigil.png')
  ]);
  console.log(`  [OK] 深淵印記圖標生成成功！已儲存至 public/sigil.png (${(sigilSize / 1024).toFixed(1)} KB)`);

  // 2. Generate Sleek Minimalist Panoramic Header Strip (replacing cathedral wallpaper)
  console.log('\n>>> [2/2] 正在生成專為頂端 Header 打造的俐落深海全景長條紋理 (Header Strip)...');
  const headerStripWorkflow = buildWorkflow({
    promptText: 'masterpiece, best quality, ultra-detailed, dark luxury fantasy game header banner strip, horizontal panoramic widescreen 5:1 aspect ratio, deep abyssal ocean trench, minimalist underwater horizon, ethereal glowing cyan bioluminescent water ripples, obsidian stone and subtle gold trim, dark navy and midnight blue gradient, subtle floating particles, clean sleek composition, elegant trading card game header bar background',
    negativePrompt: 'busy, cluttered, cathedral, buildings, bright daylight, sunny, noisy, lowres, text, watermark, signature, blurry, colorful cartoon, crowded',
    width: 1280,
    height: 320,
    seed: 777123999,
    filenamePrefix: 'abyssal_header_strip'
  });

  const headerPromptId = await queueWorkflow(headerStripWorkflow);
  console.log(`  -> 已提交至 ComfyUI (ID: ${headerPromptId})，正在生成中...`);
  const headerImgInfo = await waitForCompletion(headerPromptId);
  const headerSize = await downloadImage(headerImgInfo, [
    path.join(PUBLIC_DIR, 'header-strip.png'),
    path.join(IMAGES_DIR, 'header-strip.png'),
    path.join(PUBLIC_DIR, 'header-banner.jpg')
  ]);
  console.log(`  [OK] 專屬 Header 全景紋理生成成功！已儲存至 public/header-strip.png (${(headerSize / 1024).toFixed(1)} KB)`);

  console.log('\n====================================================');
  console.log('🎉 專屬印記與 Header 長條紋理已全數生成完成！');
  console.log('====================================================');
}

run().catch((err) => {
  console.error('[Error]:', err);
  process.exit(1);
});

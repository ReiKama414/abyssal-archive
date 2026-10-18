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
  console.log('  ABYSSAL ARCHIVE — ComfyUI 品牌視覺生成 (Logo & Header)');
  console.log('====================================================\n');

  // 1. Generate Game Logo
  console.log('>>> [1/2] 正在為「深淵幻藏 (Abyssal Archive)」生成官方品牌 Logo...');
  const logoWorkflow = buildWorkflow({
    promptText: 'masterpiece, best quality, ultra-detailed, game logo emblem, round insignia medallion crest, sacred deep sea bioluminescent jellyfish seal, royal golden filigree frame, glowing cyan tentacles, dark ocean navy obsidian background, elegant dark fantasy game icon, clean sharp vector detailing, fantasy tcg game emblem, prestigious metallic rim',
    negativePrompt: 'lowres, bad anatomy, text, watermark, signature, blurry, cropped, messy background, distorted, humans, face, 3d render plastic',
    width: 896,
    height: 896,
    seed: 888777666,
    filenamePrefix: 'abyssal_brand_logo'
  });

  const logoPromptId = await queueWorkflow(logoWorkflow);
  console.log(`  -> 已提交至 ComfyUI (ID: ${logoPromptId})，正在生成中...`);
  const logoImgInfo = await waitForCompletion(logoPromptId);
  const logoSize = await downloadImage(logoImgInfo, [
    path.join(PUBLIC_DIR, 'logo.png'),
    path.join(IMAGES_DIR, 'logo.png')
  ]);
  console.log(`  [OK] Logo 生成成功！已儲存至 public/logo.png (${(logoSize / 1024).toFixed(1)} KB)`);

  // 2. Generate Cinematic Header Banner
  console.log('\n>>> [2/2] 正在為全站 Header 與 Hero 橫幅生成沉浸式寬螢幕主視覺...');
  const headerWorkflow = buildWorkflow({
    promptText: 'masterpiece, best quality, ultra-detailed, cinematic panoramic widescreen banner, sunken ancient abyssal underwater library cathedral, towering stone gothic arches, deep ocean trench, ethereal bioluminescent giant jellyfish drifting, luminous glowing coral reefs, cyan and turquoise caustic volumetric light rays, deep dark navy water, floating magic particles, epic fantasy landscape wallpaper, header banner art',
    negativePrompt: 'lowres, blurry, bad anatomy, text, watermark, signature, ugly, distorted, oversaturated cartoon, daylight, sunny, surface',
    width: 1280,
    height: 640,
    seed: 999333111,
    filenamePrefix: 'abyssal_header_banner'
  });

  const headerPromptId = await queueWorkflow(headerWorkflow);
  console.log(`  -> 已提交至 ComfyUI (ID: ${headerPromptId})，正在生成中...`);
  const headerImgInfo = await waitForCompletion(headerPromptId);
  const headerSize = await downloadImage(headerImgInfo, [
    path.join(PUBLIC_DIR, 'header-banner.jpg'),
    path.join(IMAGES_DIR, 'header-banner.jpg')
  ]);
  console.log(`  [OK] Header Banner 生成成功！已儲存至 public/header-banner.jpg (${(headerSize / 1024).toFixed(1)} KB)`);

  console.log('\n====================================================');
  console.log('🎉 兩張品牌視覺已全數成功由 ComfyUI 生成並存入專案！');
  console.log('====================================================');
}

run().catch((err) => {
  console.error('[Error]:', err);
  process.exit(1);
});

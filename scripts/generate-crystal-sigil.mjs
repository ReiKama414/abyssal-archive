import fs from 'fs';
import path from 'path';

const COMFY_URL = 'http://127.0.0.1:8188';
const PUBLIC_DIR = path.resolve('public');

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
  if (!res.ok) throw new Error(`Queue failed: ${await res.text()}`);
  const data = await res.json();
  return data.prompt_id;
}

async function waitForCompletion(promptId) {
  for (let i = 0; i < 200; i++) {
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

async function downloadImage(imgInfo, targetPath) {
  const viewUrl = `${COMFY_URL}/view?filename=${encodeURIComponent(imgInfo.filename)}&subfolder=${encodeURIComponent(imgInfo.subfolder || '')}&type=${encodeURIComponent(imgInfo.type || 'output')}`;
  const res = await fetch(viewUrl);
  if (!res.ok) throw new Error(`Download failed`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(targetPath, buffer);
  return buffer.length;
}

async function run() {
  console.log('Generating refined Abyssal Crystal Sigil...');
  const workflow = buildWorkflow({
    promptText: 'masterpiece, best quality, ultra-detailed, game ui icon, sacred abyssal crystal rune emblem, glowing neon cyan and aquamarine bioluminescent jewel, gold filigree trim, dark navy obsidian background, mystical oceanic relic icon, sharp vector gaming icon, centered circular emblem, isolated icon on dark background',
    negativePrompt: 'lowres, text, watermark, signature, blurry, deformed, human, face, messy, cartoon, yellow sparkles, stars',
    width: 512,
    height: 512,
    seed: 314159265,
    filenamePrefix: 'abyssal_crystal_sigil'
  });

  const promptId = await queueWorkflow(workflow);
  const imgInfo = await waitForCompletion(promptId);
  const size = await downloadImage(imgInfo, path.join(PUBLIC_DIR, 'abyssal-sigil.png'));
  console.log('Saved to public/abyssal-sigil.png:', size, 'bytes');
}

run();

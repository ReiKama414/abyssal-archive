const COMFY_URL = 'http://127.0.0.1:8188';

async function testOne() {
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
        "text": "masterpiece, best quality, ultra-detailed, luminous deep sea hagfish, bioluminescent cyan slime, abyssal oceanic trench, 8k resolution fantasy trading card art",
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "7": {
      "inputs": {
        "text": "lowres, bad anatomy, text, error, blurry, low quality",
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
        "filename_prefix": "test_timing",
        "images": ["8", 0]
      },
      "class_type": "SaveImage"
    }
  };

  const startTime = Date.now();
  console.log('Sending prompt to ComfyUI...');
  const res = await fetch(`${COMFY_URL}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: promptWorkflow })
  });

  if (!res.ok) {
    console.error('Queue failed:', await res.text());
    return;
  }

  const { prompt_id } = await res.json();
  console.log('Queued with prompt_id:', prompt_id);

  while (true) {
    await new Promise(r => setTimeout(r, 500));
    const histRes = await fetch(`${COMFY_URL}/history/${prompt_id}`);
    if (histRes.ok) {
      const hist = await histRes.json();
      if (hist[prompt_id]?.outputs?.["9"]?.images?.[0]) {
        const img = hist[prompt_id].outputs["9"].images[0];
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Success! Image generated in ${elapsed}s:`, img.filename);
        break;
      }
    }
  }
}

testOne();

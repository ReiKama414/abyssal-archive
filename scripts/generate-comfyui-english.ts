import fs from 'fs';
import path from 'path';

const COMFY_URL = 'http://127.0.0.1:8188';

// Pure English keyword prompts tailored to each card's exact name, character, creature, and lore
export const CARD_ENGLISH_PROMPTS: Record<string, string> = {
  // 1. ABYSSAL JELLYFISH
  'abyss-01': 'masterpiece, best quality, ultra-detailed, tiny glowing baby jellyfish, luminous polyp, translucent round bell, delicate glowing tendrils, floating plankton, abyssal ocean darkness, soft cyan bioluminescence',
  'abyss-02': 'masterpiece, best quality, ultra-detailed, metallic silver deep sea spiny needlefish, sharp metallic fins and dorsal spines, glowing cyan eyes, swimming through dark oceanic trench, underwater bubbles',
  'abyss-03': 'masterpiece, best quality, ultra-detailed, glowing prismatic sea anemone, crystal translucent tentacles refracting rainbow light, hydrothermal volcanic ocean vent, dark seabed rocks, bioluminescent glow',
  'abyss-04': 'masterpiece, best quality, ultra-detailed, deep sea venomous sea urchin, glowing electric blue rings on sharp long needles, sapphire bioluminescent points, oceanic dark seabed, caustics',
  'abyss-05': 'masterpiece, best quality, ultra-detailed, ancient starlight starfish, glowing emerald green bioluminescent moss on stone texture, resting on sunken coral temple ruins in dark sea floor',
  'abyss-06': 'masterpiece, best quality, ultra-detailed, elegant translucent purple glazed jellyfish, delicate feather-like frilled oral arms, violet and amethyst glow, deep water caustics, floating particles',
  'abyss-07': 'masterpiece, best quality, ultra-detailed, Portuguese man-of-war siphonophore jellyfish, iridescent blue floating sail crest, long trailing glowing venom tentacles, midnight ocean abyss',
  'abyss-08': 'masterpiece, best quality, ultra-detailed, black pearl chambered nautilus, lustrous obsidian spiral shell with golden geometric filigree, swimming in deep sea darkness, glowing sea flora',
  'abyss-09': 'masterpiece, best quality, ultra-detailed, crimson immortal lighthouse jellyfish, glowing ruby core lantern organ, long gossamer tentacles trailing through deep abyssal trench, red bioluminescence',
  'abyss-10': 'masterpiece, best quality, ultra-detailed, cute baby azure sea dragon whelp, glistening cyan scales, translucent aquatic fins, swimming inside a glowing water bubble sphere, deep sea',
  'abyss-11': 'masterpiece, best quality, ultra-detailed, clione sea angel, translucent glowing butterfly wings, ethereal aquatic spirit fairy creature, glowing cyan and magenta heart, dark ocean caustics',
  'abyss-13': 'masterpiece, best quality, ultra-detailed, colossal ancient whale leviathan titan, carrying ancient sunken Atlantis temple ruins and coral spires on its back, bioluminescent blue sea vents, deep ocean',
  'abyss-14': 'masterpiece, best quality, ultra-detailed, gargantuan primordial jellyfish queen sovereign, colossal translucent cyan umbrella with fractal gossamer veils, deep ocean abyss, underwater aurora light',
  'abyss-16': 'masterpiece, best quality, ultra-detailed, mythical emerald green sea serpent dragon whelp, lustrous jade scales, translucent sea fins, coiling playfully around glowing oceanic pearl',
  'abyss-17': 'masterpiece, best quality, ultra-detailed, giant deep sea spider crab, vibrant glowing bioluminescent corals and sea anemones growing on rocky carapace, walking on abyssal ocean floor',
  'abyss-18': 'masterpiece, best quality, ultra-detailed, ghostly ethereal tidal jellyfish, translucent glowing white and turquoise phantom veil tentacles, swimming through glowing moonlit ocean swells',

  // 2. NOCTURNE FANTASY
  'nocturne-01': 'masterpiece, best quality, ultra-detailed, 1girl, cute young anime mage apprentice, pointy witch hat, holding carved wooden staff casting purple star sparkles, library with spellbooks, gothic anime',
  'nocturne-02': 'masterpiece, best quality, ultra-detailed, mystical black raven bird, glowing crimson eyes, obsidian glossy feathers, perched on gothic stone gargoyle cathedral spire, giant full moon, dark misty sky',
  'nocturne-03': 'masterpiece, best quality, ultra-detailed, adorable black winged cat familiar, glowing amber eyes, smoky ember flame tail, floating above antique open magic grimoire book, mystical library',
  'nocturne-04': 'masterpiece, best quality, ultra-detailed, dark shadow wraith phantom servant, faceless dark hooded cowl, glowing violet spirit lantern, gliding through misty gothic castle stone hallway',
  'nocturne-06': 'masterpiece, best quality, ultra-detailed, 1girl, beautiful anime alchemist, blonde hair, round glasses, holding glowing emerald elixir potion flask, alchemy laboratory with glassware, magic circles',
  'nocturne-07': 'masterpiece, best quality, ultra-detailed, 1boy, handsome anime gunslinger, black leather duster coat, holding dual engraved silver revolvers, swirling red rose petals, moonlit gothic ruins',
  'nocturne-08': 'masterpiece, best quality, ultra-detailed, 1girl, gothic anime scarlet nun, black and red habit veil, silver cross necklace, holding ornate holy rapier sword, stained glass cathedral, red moonlight',
  'nocturne-09': 'masterpiece, best quality, ultra-detailed, 1boy, celestial anime magus sorcerer, silver hair, deep blue robes embroidered with gold constellations, crystal staff radiating starlight, galaxy cosmos',
  'nocturne-11': 'masterpiece, best quality, ultra-detailed, 1boy, fallen angel archangel Lucifer, twelve glorious obsidian black feathered wings, dark gothic silver plate armor, broadsword burning with black flame',
  'nocturne-12': 'masterpiece, best quality, ultra-detailed, 1girl, ethereal silver-white haired anime sorceress goddess, floating in cosmos, holding orb of swirling galaxy, glowing arcane circles, violet astral light',
  'nocturne-14': 'masterpiece, best quality, ultra-detailed, fierce stone gargoyle demon statue, bat wings, glowing red eyes, crouching on gothic cathedral roof spire, thunderstorm lightning, dark rain',
  'nocturne-15': 'masterpiece, best quality, ultra-detailed, 1girl, mysterious anime astrologer, navy blue hooded cloak with gold embroidery, gazing into glowing crystal celestial sphere, glowing zodiac star chart',
  'nocturne-16': 'masterpiece, best quality, ultra-detailed, 1girl, gothic grim reaper goddess Hel, black hooded cowl, ornate silver scythe with spectral blue mist, misty graveyard, floating spirit wisps',
  'nocturne-17': 'masterpiece, best quality, ultra-detailed, imposing anime demon lord Baal, curved obsidian horns, dark spiky armor with glowing crimson magma cracks, seated on throne of dark stone and skulls',

  // 3. NEON DISTRICT
  'neon-01': 'masterpiece, best quality, ultra-detailed, sleek robotic police dog, armored cybernetic plating, glowing cyan optics, walking on rain-slicked cyberpunk street, neon city reflections at night',
  'neon-02': 'masterpiece, best quality, ultra-detailed, 1boy, anime cyberpunk courier rider, high-tech motorcycle, helmet with neon orange visor, rain-soaked asphalt, futuristic skyscrapers with neon signs',
  'neon-03': 'masterpiece, best quality, ultra-detailed, 1girl, energetic anime cyberpunk graffiti hacker girl, twintails, spraying glowing neon graffiti on brick wall, holographic AR goggles, cyber alley',
  'neon-04': 'masterpiece, best quality, ultra-detailed, 1man, veteran cyberpunk ripperdoc mechanic, bionic eye, cybernetic robotic arm with precision tools, cluttered high-tech repair clinic, glowing wires',
  'neon-05': 'masterpiece, best quality, ultra-detailed, 1boy, cyber ronin samurai warrior, sleek dark armor, glowing cyan high-frequency katana blade, robotic eye implant, rain-slicked neon street',
  'neon-06': 'masterpiece, best quality, ultra-detailed, 1girl, beautiful holographic anime pop idol singer, translucent cyan and magenta shimmering body, holding microphone on illuminated neon concert stage',
  'neon-07': 'masterpiece, best quality, ultra-detailed, 1girl, mecha musume, pilot in heavy white and orange armored battlesuit, shoulder missile pods, plasma cannon, futuristic hangar launch bay',
  'neon-08': 'masterpiece, best quality, ultra-detailed, cyber matrix ghost phantom, humanoid silhouette formed from green cascading digital matrix code and optical circuit fibers, dark digital cyberspace',
  'neon-09': 'masterpiece, best quality, ultra-detailed, 1boy, ruthless cyberpunk corporate inquisitor, black armored trench coat, glowing red holographic visor, dual glowing plasma energy blades, rooftop',
  'neon-10': 'masterpiece, best quality, ultra-detailed, 1girl, colossal glowing blonde holographic anime goddess interface Gaia, floating inside dark supercomputer server room, optic cables, floating data cubes',
  'neon-12': 'masterpiece, best quality, ultra-detailed, hooded netrunner hacker silhouette, surrounded by floating holographic screens, neon purple skull cyber terminal, dark web matrix node',
  'neon-13': 'masterpiece, best quality, ultra-detailed, 1girl, strict cyberpunk police enforcer chief, tactical coat, high-tech anti-materiel sniper rifle, flying police drones, neon metropolis balcony',
  'neon-14': 'masterpiece, best quality, ultra-detailed, 1girl, anime cyborg girl floating inside transparent cylindrical cryogenic stasis pod, glowing blue neural cables connected to head, opening glowing eyes',

  // 4. PHANTOM BEASTS
  'beast-01': 'masterpiece, best quality, ultra-detailed, adorable baby spirit fox kit, pure white fur, blue spiritual flame hovering above head, curled on mossy branch under glowing starry night sky',
  'beast-02': 'masterpiece, best quality, ultra-detailed, graceful mystical white cat, two fluffy split tails with icy mist, glowing sapphire eyes, walking on snowy tree branch leaving glowing frost pawprints',
  'beast-03': 'masterpiece, best quality, ultra-detailed, young silver wolf pup, small crystalline horn on forehead, howling at glowing green aurora borealis on snowy mountain summit, starry night',
  'beast-04': 'masterpiece, best quality, ultra-detailed, cute baby pegasus foal, pure white coat, small feathered wings, standing on soft pink celestial clouds under starlight, pastel fantasy colors',
  'beast-05': 'masterpiece, best quality, ultra-detailed, majestic red kitsune fox, three fiery tails trailing burning embers and spiritual flames, amber eyes, misty bamboo forest at night',
  'beast-06': 'masterpiece, best quality, ultra-detailed, colossal shadowy direwolf beast, glowing violet eyes, fur dissolving into dark mist, howling at giant full blood moon from rocky cliff',
  'beast-07': 'masterpiece, best quality, ultra-detailed, magnificent serpentine oriental dragon, lustrous emerald jade scales, golden whiskers and antlers, coiling around misty waterfall mountain peak',
  'beast-08': 'masterpiece, best quality, ultra-detailed, breathtaking pure white fox Yukihime, six elegant flowing tails, silver frost aura, standing under luminous giant full moon with falling sakura petals',
  'beast-11': 'masterpiece, best quality, ultra-detailed, sacred divine oriental qilin kirin beast, golden dragon scales, glowing hooves standing on cloud, five-element mystic halo rings around antlers',
  'beast-13': 'masterpiece, best quality, ultra-detailed, mythical phoenix peacock bird, iridescent rainbow plumage trailing sacred spiritual fire flames, standing proudly on ancient pagoda roof',
  'beast-14': 'masterpiece, best quality, ultra-detailed, mighty golden celestial roc eagle, feathers crackling with yellow thunder and lightning bolts, soaring across stormy clouds, epic fantasy',
  'beast-15': 'masterpiece, best quality, ultra-detailed, apocalyptic giant black wolf Fenrir, glowing red demonic runes carved into fur, broken iron chains, fangs dripping cosmic void, desolate battlefield',
  'beast-16': 'masterpiece, best quality, ultra-detailed, colossal ancient torch dragon Zhulong, crimson and obsidian scales, clutching blazing celestial torch in jaws, coiled around cosmic pillars in netherworld',

  // 5. FESTIVAL & HOLIDAY
  'fest-halloween-01': 'masterpiece, best quality, ultra-detailed, 1girl, cute anime Halloween witch, pointy witch hat, orange and purple ruffled dress, holding carved glowing jack-o-lantern pumpkin, bats, full moon',
  'fest-halloween-02': 'masterpiece, best quality, ultra-detailed, spooky anime jester death reaper, black and purple clown costume, skull mask with glowing cyan smile, holding spectral cards and silver scythe',
  'fest-halloween-03': 'masterpiece, best quality, ultra-detailed, 1boy, handsome anime vampire count Dracula, ornate black and gold masquerade costume, velvet cape, holding crystal wine glass, gothic ballroom, bats',
  'fest-christmas-01': 'masterpiece, best quality, ultra-detailed, 1girl, adorable anime winter snow fairy Noel, red and white fluffy santa outfit, translucent icy wings, holding gift box with golden ribbon, falling snow',
  'fest-christmas-02': 'masterpiece, best quality, ultra-detailed, magnificent divine white reindeer stag Yule, crystalline antlers glowing with emerald and magenta aurora borealis, snowy pine forest, winter stars',
  'fest-newyear-01': 'masterpiece, best quality, ultra-detailed, 1girl, beautiful anime shrine maiden dawn goddess Asahi, white and crimson ceremonial kimono, holding golden bells, sunrise over Mount Fuji, red sun',
  'fest-newyear-02': 'masterpiece, best quality, ultra-detailed, serpentine golden Chinese dragon, imperial golden scales, holding blazing red celestial pearl, surrounded by red festival lanterns and gold coins',
  'fest-valentines-01': 'masterpiece, best quality, ultra-detailed, 1girl, cute anime chocolatier girl, holding heart-shaped chocolate gift box with pink silk ribbons, romantic cafe setting, floating sweet hearts',
  'fest-valentines-02': 'masterpiece, best quality, ultra-detailed, 1girl, gorgeous blonde anime bride Victoria, elaborate translucent white lace wedding gown, crystal rose veil, holding glowing white rose bouquet, chapel',
  'fest-sakura-01': 'masterpiece, best quality, ultra-detailed, 1girl, beautiful anime swordswoman Miou, pink sakura floral kimono armor, wielding katana sword cutting through whirlwind of cherry blossom petals',
  'fest-sakura-02': 'masterpiece, best quality, ultra-detailed, 1girl, ethereal anime tree spirit goddess, hair of blooming pink cherry blossoms, petal dress, sitting on giant ancient glowing sacred sakura tree',
  'fest-summer-01': 'masterpiece, best quality, ultra-detailed, 1girl, lovely anime girl Furin wearing dark blue goldfish yukata kimono, holding glass wind chime, festival paper lantern stalls, summer night fireworks',
  'fest-summer-02': 'masterpiece, best quality, ultra-detailed, mythical festival dragon formed from sparkling colorful fireworks, glowing sparks and trails, soaring over summer night festival lake',
  'fest-midautumn-01': 'masterpiece, best quality, ultra-detailed, 1girl, cute anime rabbit fairy Tangtang with long white bunny ears, holding golden mortar and pestle, plate of mooncakes, glowing crescent moon',
  'fest-anniv-01': 'masterpiece, best quality, ultra-detailed, cute anime fairy librarian Kura, small gossamer wings, holding oversized ornate golden key, floating in grand library with endless magical books',
  'fest-anniv-03': 'masterpiece, best quality, ultra-detailed, 1girl, divine celestial weaver maiden goddess, flowing celestial silks, weaving tapestry of golden stardust and nebulas, celebratory fireworks',
  'fest-eclipse-01': 'masterpiece, best quality, ultra-detailed, 1girl, mysterious dark-skinned anime priestess Nef, dark purple robes, holding obsidian sundial, dark solar eclipse in violet night sky',
  'fest-eclipse-03': 'masterpiece, best quality, ultra-detailed, colossal shadow dragon Apophis, obsidian wings eclipsing the golden sun, black dragon scales with violet edges, total solar eclipse corona'
};

async function queuePrompt(cardId: string, promptText: string, clientId: string) {
  const negativePrompt = 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, draft, signature';

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
        "text": `${promptText}, vibrant colors, cinematic lighting, dynamic angle, official trading card game art`,
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
    body: JSON.stringify({ prompt: promptWorkflow, client_id: clientId })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Queue failed for ${cardId}: ${errText}`);
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
  const clientId = 'batch_eng_' + Math.random().toString(36).substring(7);

  // Protected cards that already have master-tier AI paintings (> 500KB)
  const PROTECTED_IDS = new Set([
    'abyss-15',
    'nocturne-13',
    'neon-11',
    'beast-12',
    'abyss-12',
    'nocturne-10',
    'beast-09',
    'beast-10',
    'fest-anniv-02',
    'fest-eclipse-02',
    'fest-midautumn-02',
  ]);

  const cardIds = Object.keys(CARD_ENGLISH_PROMPTS).filter(id => !PROTECTED_IDS.has(id));

  console.log(`\n======================================================`);
  console.log(`ComfyUI English Prompt Batch Generator`);
  console.log(`Total target cards to generate: ${cardIds.length}`);
  console.log(`Protected master AI paintings: ${PROTECTED_IDS.size}`);
  console.log(`======================================================\n`);

  let count = 0;
  for (const cardId of cardIds) {
    count++;
    const prompt = CARD_ENGLISH_PROMPTS[cardId];
    const startTime = Date.now();
    process.stdout.write(`[${count}/${cardIds.length}] ${cardId}... `);

    try {
      const promptId = await queuePrompt(cardId, prompt, clientId);
      const imgInfo = await waitForPrompt(promptId);
      const targetPath = path.join(cardsDir, `${cardId}.jpg`);
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

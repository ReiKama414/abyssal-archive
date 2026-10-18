import { CardDefinition } from '@/types';

/**
 * Generates deterministic mathematical values based on a string seed
 */
export function pseudoRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * Generates an SVG string representation of the card's artwork
 * with multi-layered depth for 3D parallax and living card animations.
 */
export function generateCardSvg(card: CardDefinition, isLiving = false): string {
  const rng = pseudoRandom(card.id + card.visualSeed);
  const { primary, accent, glow } = card.palette;

  // Background gradient and stars/ambient particles
  const particleCount = 24;
  let particlesSvg = '';
  for (let i = 0; i < particleCount; i++) {
    const cx = Math.floor(rng() * 400);
    const cy = Math.floor(rng() * 560);
    const r = (rng() * 2.5 + 0.8).toFixed(1);
    const opacity = (rng() * 0.7 + 0.2).toFixed(2);
    particlesSvg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${glow}" opacity="${opacity}" class="${isLiving ? 'particle-float' : ''}"/>`;
  }

  // Generate series-specific artwork layers
  let mainGraphic = '';

  if (card.series === 'abyssal-jellyfish') {
    // Bioluminescent jellyfish with layered cap, oral arms, and tentacles
    const bellWidth = 140 + rng() * 40;
    const bellHeight = 100 + rng() * 30;
    const cx = 200;
    const cy = 180 + rng() * 40;

    let tentacles = '';
    const tentacleCount = 9;
    for (let i = 0; i < tentacleCount; i++) {
      const offsetX = cx - bellWidth / 2 + (bellWidth / (tentacleCount - 1)) * i;
      const cp1x = offsetX + (rng() - 0.5) * 60;
      const cp1y = cy + 120 + rng() * 40;
      const cp2x = offsetX + (rng() - 0.5) * 80;
      const cp2y = cy + 240 + rng() * 60;
      const endX = offsetX + (rng() - 0.5) * 50;
      const endY = cy + 340 + rng() * 40;
      const strokeWidth = (rng() * 2 + 1).toFixed(1);
      const tentacleClass = isLiving ? `tentacle-wave tentacle-${i % 3}` : '';

      tentacles += `
        <path d="M ${offsetX} ${cy + 40} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}"
              stroke="${accent}" stroke-width="${strokeWidth}" fill="none" opacity="0.85"
              stroke-linecap="round" class="${tentacleClass}" filter="url(#glow-${card.id})"/>
      `;
    }

    mainGraphic = `
      <!-- Deep sea volumetric beams -->
      <path d="M 50 0 L 150 560 L 220 560 L 120 0 Z" fill="${accent}" opacity="0.08"/>
      <path d="M 280 0 L 380 560 L 320 560 L 220 0 Z" fill="${glow}" opacity="0.06"/>
      
      <!-- Underwater ruins silhouette in deep background -->
      <polygon points="20,560 60,420 110,420 130,560" fill="#040b17" opacity="0.75"/>
      <polygon points="290,560 320,380 370,380 400,560" fill="#040b17" opacity="0.75"/>
      <line x1="60" y1="440" x2="110" y2="440" stroke="${primary}" stroke-width="2" opacity="0.4"/>
      
      <!-- Jellyfish Bell -->
      <g class="${isLiving ? 'jellyfish-pulse' : ''}">
        ${tentacles}
        <!-- Bell Outer Glow -->
        <ellipse cx="${cx}" cy="${cy}" rx="${bellWidth / 2}" ry="${bellHeight / 2}" 
                 fill="url(#bellGrad-${card.id})" filter="url(#glow-${card.id})" opacity="0.9"/>
        <!-- Inner organ bioluminescence -->
        <ellipse cx="${cx}" cy="${cy - 10}" rx="${bellWidth / 3.5}" ry="${bellHeight / 3.5}" 
                 fill="${glow}" opacity="0.85" filter="url(#brightGlow-${card.id})"/>
        <!-- Luminous rim dots -->
        <path d="M ${cx - bellWidth / 2} ${cy + 10} Q ${cx} ${cy + 35} ${cx + bellWidth / 2} ${cy + 10}" 
              stroke="${glow}" stroke-width="3" fill="none" opacity="0.9" stroke-dasharray="4,8"/>
      </g>
    `;
  } else if (card.series === 'nocturne-fantasy') {
    // Gothic anime magic seals, crescent eclipse, and mysterious character/entity silhouettes
    const sealRadius = 110;
    const cx = 200;
    const cy = 240;

    let runes = '';
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45 * Math.PI) / 180;
      const rx = cx + Math.cos(angle) * (sealRadius - 20);
      const ry = cy + Math.sin(angle) * (sealRadius - 20);
      runes += `<circle cx="${rx}" cy="${ry}" r="4" fill="${glow}"/>
                <line x1="${cx}" y1="${cy}" x2="${rx}" y2="${ry}" stroke="${accent}" stroke-width="0.8" opacity="0.5"/>`;
    }

    mainGraphic = `
      <!-- Gothic Cathedral Stained-Glass Arche -->
      <path d="M 60 560 L 60 220 Q 200 60 340 220 L 340 560 Z" 
            stroke="${primary}" stroke-width="2.5" fill="none" opacity="0.4"/>
      <path d="M 90 560 L 90 240 Q 200 110 310 240 L 310 560 Z" 
            stroke="${accent}" stroke-width="1.5" fill="none" opacity="0.3"/>
            
      <!-- Crescent Dark Moon -->
      <circle cx="200" cy="170" r="70" fill="url(#moonGrad-${card.id})" filter="url(#glow-${card.id})"/>
      <circle cx="230" cy="150" r="60" fill="#060611"/>

      <!-- Magic Occult Circle -->
      <g class="${isLiving ? 'magic-circle-spin' : ''}">
        <circle cx="${cx}" cy="${cy}" r="${sealRadius}" stroke="${glow}" stroke-width="2" fill="none" opacity="0.75" stroke-dasharray="6,4"/>
        <circle cx="${cx}" cy="${cy}" r="${sealRadius - 15}" stroke="${accent}" stroke-width="1.5" fill="none" opacity="0.85"/>
        <polygon points="${cx},${cy - sealRadius + 15} ${cx + sealRadius - 25},${cy + sealRadius / 2} ${cx - sealRadius + 25},${cy + sealRadius / 2}" 
                 stroke="${glow}" stroke-width="1.5" fill="none" opacity="0.6"/>
        <polygon points="${cx},${cy + sealRadius - 15} ${cx + sealRadius - 25},${cy - sealRadius / 2} ${cx - sealRadius + 25},${cy - sealRadius / 2}" 
                 stroke="${glow}" stroke-width="1.5" fill="none" opacity="0.6"/>
        ${runes}
      </g>

      <!-- Gothic Anime Character Silhouette with flowing cloak & floating magic orb -->
      <path d="M 170 560 L 180 370 Q 185 320 200 310 Q 215 320 220 370 L 230 560 Z" fill="#080816"/>
      <!-- Floating Anime Hair/Spikes -->
      <path d="M 180 330 Q 140 370 110 440 Q 160 390 190 350 Z" fill="#140f28" opacity="0.9"/>
      <path d="M 220 330 Q 260 370 290 440 Q 240 390 210 350 Z" fill="#140f28" opacity="0.9"/>
      <!-- Glowing Eyes or Soul Orb -->
      <circle cx="200" cy="315" r="14" fill="${glow}" filter="url(#brightGlow-${card.id})"/>
      <circle cx="200" cy="315" r="6" fill="#ffffff"/>
    `;
  } else if (card.series === 'neon-district') {
    // Cyberpunk neon city, rain streaks, holographic grids, and skyscrapers
    let rainPaths = '';
    if (isLiving) {
      for (let i = 0; i < 20; i++) {
        const rx = Math.floor(rng() * 400);
        const ry = Math.floor(rng() * 300);
        rainPaths += `<line x1="${rx}" y1="${ry}" x2="${rx - 15}" y2="${ry + 60}" stroke="${accent}" stroke-width="1" opacity="0.6" class="rain-drop"/>`;
      }
    }

    mainGraphic = `
      <!-- Distant Megacity Silhouette -->
      <rect x="30" y="240" width="60" height="320" fill="#050814"/>
      <rect x="80" y="160" width="80" height="400" fill="#070c1d"/>
      <rect x="150" y="200" width="100" height="360" fill="#0a1027"/>
      <rect x="240" y="140" width="70" height="420" fill="#060918"/>
      <rect x="300" y="260" width="70" height="300" fill="#040612"/>

      <!-- Neon Windows and Signboards -->
      <rect x="170" y="220" width="12" height="70" fill="${primary}" opacity="0.8" filter="url(#glow-${card.id})"/>
      <rect x="100" y="190" width="45" height="10" fill="${accent}" opacity="0.9" filter="url(#brightGlow-${card.id})"/>
      <line x1="260" y1="160" x2="260" y2="340" stroke="${glow}" stroke-width="3" opacity="0.8" stroke-dasharray="10,15"/>

      <!-- Holographic Grid Floor -->
      <g opacity="0.45">
        <line x1="0" y1="460" x2="400" y2="460" stroke="${primary}" stroke-width="1.5"/>
        <line x1="0" y1="490" x2="400" y2="490" stroke="${primary}" stroke-width="1.5"/>
        <line x1="0" y1="530" x2="400" y2="530" stroke="${primary}" stroke-width="2"/>
        <line x1="200" y1="420" x2="0" y2="560" stroke="${accent}" stroke-width="1.5"/>
        <line x1="200" y1="420" x2="100" y2="560" stroke="${accent}" stroke-width="1.5"/>
        <line x1="200" y1="420" x2="200" y2="560" stroke="${accent}" stroke-width="1.5"/>
        <line x1="200" y1="420" x2="300" y2="560" stroke="${accent}" stroke-width="1.5"/>
        <line x1="200" y1="420" x2="400" y2="560" stroke="${accent}" stroke-width="1.5"/>
      </g>

      <!-- Giant Neon Kanji / Cyber Icon Circle -->
      <circle cx="200" cy="180" r="75" stroke="${accent}" stroke-width="3" fill="none" opacity="0.8" filter="url(#brightGlow-${card.id})"/>
      <path d="M 160 180 L 240 180 M 200 140 L 200 220 M 175 155 L 225 205" stroke="${glow}" stroke-width="3" stroke-linecap="round" opacity="0.9"/>
      
      <!-- Rain overlay -->
      ${rainPaths}
    `;
  } else if (card.series === 'phantom-beasts') {
    // Mythical beasts: kitsune nine-tails, celestial dragon, spirit wolf
    const cx = 200;
    const cy = 250;

    mainGraphic = `
      <!-- Celestial Aura Radial Flares -->
      <circle cx="${cx}" cy="${cy}" r="110" fill="url(#spiritGrad-${card.id})" opacity="0.6" filter="url(#glow-${card.id})"/>
      
      <!-- Spirit Beast Crest / Silhouette (Dragon/Fox/Wolf Head) -->
      <g class="${isLiving ? 'spirit-beast-float' : ''}">
        <!-- Majestic Horns / Crest -->
        <path d="M 160 210 Q 110 130 90 90 Q 130 140 170 190 Z" fill="${primary}" filter="url(#glow-${card.id})"/>
        <path d="M 240 210 Q 290 130 310 90 Q 270 140 230 190 Z" fill="${primary}" filter="url(#glow-${card.id})"/>

        <!-- Spectral Tails / Flames -->
        <path d="M 140 320 Q 60 290 50 200 Q 90 260 150 290 Z" fill="${accent}" opacity="0.75" filter="url(#brightGlow-${card.id})"/>
        <path d="M 260 320 Q 340 290 350 200 Q 310 260 250 290 Z" fill="${accent}" opacity="0.75" filter="url(#brightGlow-${card.id})"/>
        <path d="M 170 340 Q 90 400 80 480 Q 130 420 180 350 Z" fill="${accent}" opacity="0.85"/>
        <path d="M 230 340 Q 310 400 320 480 Q 270 420 220 350 Z" fill="${accent}" opacity="0.85"/>

        <!-- Beast Head Silhouette -->
        <polygon points="200,320 160,240 180,210 200,230 220,210 240,240" fill="#070a14"/>
        
        <!-- Glowing Fierce Beast Eyes -->
        <polygon points="175,235 188,238 185,244 172,240" fill="${glow}" filter="url(#brightGlow-${card.id})"/>
        <polygon points="225,235 212,238 215,244 228,240" fill="${glow}" filter="url(#brightGlow-${card.id})"/>
        
        <!-- Celestial Star Core -->
        <circle cx="${cx}" cy="275" r="9" fill="${glow}" filter="url(#brightGlow-${card.id})"/>
        <circle cx="${cx}" cy="275" r="4" fill="#ffffff"/>
      </g>
    `;
  } else {
    // Festival & Event specific custom visual emblems
    mainGraphic = `
      <!-- Festival / Event Sun-Moon-Eclipse Grand Sigil -->
      <circle cx="200" cy="220" r="105" fill="url(#bellGrad-${card.id})" opacity="0.6" filter="url(#glow-${card.id})"/>
      <circle cx="200" cy="220" r="85" stroke="${accent}" stroke-width="2.5" fill="none" stroke-dasharray="10,6"/>
      
      <!-- Golden Astral Rays -->
      <g stroke="${glow}" stroke-width="1.8" opacity="0.75">
        <line x1="200" y1="90" x2="200" y2="350"/>
        <line x1="70" y1="220" x2="330" y2="220"/>
        <line x1="108" y1="128" x2="292" y2="312"/>
        <line x1="108" y1="312" x2="292" y2="128"/>
      </g>
      
      <!-- Central Event Icon -->
      <polygon points="200,165 240,220 200,275 160,220" fill="${primary}" stroke="${glow}" stroke-width="2.5" filter="url(#brightGlow-${card.id})"/>
      <circle cx="200" cy="220" r="15" fill="#ffffff" filter="url(#brightGlow-${card.id})"/>
    `;
  }

  // Card Frame Corners and Filigree
  const cornerDecoration = `
    <!-- Card Frame Trim -->
    <rect x="14" y="14" width="372" height="532" rx="16" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.45"/>
    <rect x="22" y="22" width="356" height="516" rx="12" fill="none" stroke="${primary}" stroke-width="0.8" opacity="0.3"/>
    
    <!-- Ornate Corner Brackets -->
    <path d="M 18 42 L 18 26 Q 18 18 26 18 L 42 18" stroke="${glow}" stroke-width="2.5" fill="none"/>
    <path d="M 382 42 L 382 26 Q 382 18 374 18 L 358 18" stroke="${glow}" stroke-width="2.5" fill="none"/>
    <path d="M 18 518 L 18 534 Q 18 542 26 542 L 42 542" stroke="${glow}" stroke-width="2.5" fill="none"/>
    <path d="M 382 518 L 382 534 Q 382 542 374 542 L 358 542" stroke="${glow}" stroke-width="2.5" fill="none"/>
  `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="100%" height="100%" class="select-none">
      <defs>
        <!-- Gradients -->
        <linearGradient id="bgGrad-${card.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#05070e"/>
          <stop offset="50%" stop-color="#0a0f1e"/>
          <stop offset="100%" stop-color="#030408"/>
        </linearGradient>

        <radialGradient id="bellGrad-${card.id}" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="${glow}" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="${accent}" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="${primary}" stop-opacity="0.1"/>
        </radialGradient>

        <radialGradient id="moonGrad-${card.id}" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="${glow}"/>
          <stop offset="60%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="#0b0e1b"/>
        </radialGradient>

        <radialGradient id="spiritGrad-${card.id}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${glow}" stop-opacity="0.9"/>
          <stop offset="40%" stop-color="${primary}" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>

        <!-- Filters for High-End Glow -->
        <filter id="glow-${card.id}" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <filter id="brightGlow-${card.id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" result="blur1"/>
          <feGaussianBlur stdDeviation="3" result="blur2"/>
          <feMerge>
            <feMergeNode in="blur1"/>
            <feMergeNode in="blur2"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="400" height="560" rx="20" fill="url(#bgGrad-${card.id})"/>

      <!-- Ambient Floating Particles -->
      ${particlesSvg}

      <!-- Main Visual Art -->
      ${mainGraphic}

      <!-- Corner Filigree -->
      ${cornerDecoration}
    </svg>
  `;
}

/**
 * Returns the unified deep sea jellyfish crest artwork for the card back
 */
export function getCardBackSvg(): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="100%" height="100%" class="select-none">
      <defs>
        <radialGradient id="backBg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#0a1226"/>
          <stop offset="60%" stop-color="#040711"/>
          <stop offset="100%" stop-color="#010205"/>
        </radialGradient>

        <radialGradient id="backSealGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00f2ff" stop-opacity="0.8"/>
          <stop offset="60%" stop-color="#1e3a8a" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>

        <linearGradient id="goldFiligree" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d4af37"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>

        <filter id="abyssGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Deep Abyss Card Back Background -->
      <rect width="400" height="560" rx="20" fill="url(#backBg)"/>

      <!-- Intricate Outer Border -->
      <rect x="16" y="16" width="368" height="528" rx="16" fill="none" stroke="url(#goldFiligree)" stroke-width="2.5" opacity="0.85"/>
      <rect x="24" y="24" width="352" height="512" rx="12" fill="none" stroke="#00f2ff" stroke-width="1" opacity="0.45"/>

      <!-- Mystical Background Seal -->
      <circle cx="200" cy="280" r="140" fill="url(#backSealGrad)"/>
      <circle cx="200" cy="280" r="120" stroke="url(#goldFiligree)" stroke-width="1.8" fill="none" stroke-dasharray="8,6" opacity="0.8"/>
      <circle cx="200" cy="280" r="95" stroke="#00f2ff" stroke-width="1.2" fill="none" opacity="0.6"/>

      <!-- Sacred Abyssal Jellyfish Emblem -->
      <g filter="url(#abyssGlow)">
        <!-- Flowing Celestial Tentacles -->
        <path d="M 180 290 Q 140 370 160 440" stroke="#00f2ff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M 220 290 Q 260 370 240 440" stroke="#00f2ff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M 195 300 Q 185 380 190 450" stroke="#38bdf8" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M 205 300 Q 215 380 210 450" stroke="#38bdf8" stroke-width="2" fill="none" stroke-linecap="round"/>
        
        <!-- Central Jellyfish Bell Dome -->
        <path d="M 130 270 Q 200 170 270 270 Q 200 285 130 270 Z" 
              fill="url(#goldFiligree)" stroke="#00f2ff" stroke-width="2"/>
        <ellipse cx="200" cy="245" rx="30" ry="25" fill="#00f2ff" opacity="0.85"/>
        <circle cx="200" cy="245" r="12" fill="#ffffff"/>
      </g>

      <!-- Arching Runes / Ancient Script -->
      <path d="M 100 130 Q 200 90 300 130" stroke="url(#goldFiligree)" stroke-width="1.5" fill="none" opacity="0.65"/>
      <path d="M 100 430 Q 200 470 300 430" stroke="url(#goldFiligree)" stroke-width="1.5" fill="none" opacity="0.65"/>

      <!-- Title Crest -->
      <text x="200" y="70" text-anchor="middle" fill="#d4af37" font-size="12" font-family="'Cinzel', serif, sans-serif" letter-spacing="4" font-weight="bold">ABYSSAL ARCHIVE</text>
      <text x="200" y="495" text-anchor="middle" fill="#00f2ff" font-size="10" font-family="'Cinzel', serif, sans-serif" letter-spacing="5" opacity="0.8">深 淵 幻 藏</text>
    </svg>
  `;
}

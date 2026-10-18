/**
 * Physical Celebration Ribbon / Streamer Engine (立體物理飄帶與彩帶禮炮系統)
 * Simulates segmented metallic foil ribbons that twist in 3D, flutter with aerodynamic
 * air resistance, and cascade gracefully across the screen.
 */

export interface RibbonOptions {
  count?: number;
  colors?: { light: string; dark: string }[];
  origin?: 'cannon-both' | 'cannon-left' | 'cannon-right' | 'center' | 'top';
  velocityMultiplier?: number;
}

export const DEFAULT_RIBBON_PALETTES = {
  gold: [
    { light: '#fde047', dark: '#b45309' },
    { light: '#fbbf24', dark: '#92400e' },
    { light: '#fef08a', dark: '#ca8a04' },
    { light: '#f59e0b', dark: '#78350f' },
  ],
  prismatic: [
    { light: '#38bdf8', dark: '#0369a1' },
    { light: '#e879f9', dark: '#86198f' },
    { light: '#fb7185', dark: '#9f1239' },
    { light: '#fde047', dark: '#a16207' },
    { light: '#4ade80', dark: '#15803d' },
    { light: '#f8fafc', dark: '#64748b' },
  ],
  abyss: [
    { light: '#00f2ff', dark: '#0369a1' },
    { light: '#818cf8', dark: '#3730a3' },
    { light: '#c084fc', dark: '#6b21a8' },
    { light: '#f43f5e', dark: '#881337' },
    { light: '#38bdf8', dark: '#0c4a6e' },
  ],
};

interface RibbonNode {
  x: number;
  y: number;
}

interface Ribbon {
  nodes: RibbonNode[];
  vx: number;
  vy: number;
  gravity: number;
  friction: number;
  width: number;
  colorLight: string;
  colorDark: string;
  twist: number;
  twistSpeed: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  life: number;
  maxLife: number;
}

class RibbonCannonsManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private ribbons: Ribbon[] = [];
  private animationFrameId: number | null = null;
  private isRunning = false;

  private initCanvas() {
    if (typeof window === 'undefined') return;
    if (this.canvas && document.body.contains(this.canvas)) return;

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'celebration-ribbon-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    this.canvas.style.overflow = 'hidden';

    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.resize();

    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    this.resize();
  };

  private resize() {
    if (!this.canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
    }
  }

  public fire(options: RibbonOptions = {}) {
    if (typeof window === 'undefined') return;
    this.initCanvas();
    if (!this.canvas || !this.ctx) return;

    const count = options.count ?? 45;
    const colors = options.colors ?? DEFAULT_RIBBON_PALETTES.prismatic;
    const origin = options.origin ?? 'cannon-both';
    const velMult = options.velocityMultiplier ?? 1;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const newRibbons: Ribbon[] = [];

    const spawnRibbon = (startX: number, startY: number, angleDeg: number, speedRange: [number, number]) => {
      const angleRad = (angleDeg * Math.PI) / 180;
      const speed = (speedRange[0] + Math.random() * (speedRange[1] - speedRange[0])) * velMult;
      const vx = Math.cos(angleRad) * speed;
      const vy = -Math.sin(angleRad) * speed;

      const nodeCount = 10 + Math.floor(Math.random() * 8); // 10 to 17 chain links
      const nodes: RibbonNode[] = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({ x: startX, y: startY });
      }

      const palette = colors[Math.floor(Math.random() * colors.length)];

      newRibbons.push({
        nodes,
        vx,
        vy,
        gravity: 0.18 + Math.random() * 0.08,
        friction: 0.982,
        width: 7 + Math.random() * 6, // 7px to 13px wide
        colorLight: palette.light,
        colorDark: palette.dark,
        twist: Math.random() * Math.PI * 2,
        twistSpeed: 0.04 + Math.random() * 0.06,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.03 + Math.random() * 0.04,
        swayAmp: 0.6 + Math.random() * 1.2,
        life: 0,
        maxLife: 240 + Math.floor(Math.random() * 120), // ~4 to 6 seconds
      });
    };

    if (origin === 'cannon-both') {
      const half = Math.floor(count / 2);
      // Left cannon shooting up-right
      for (let i = 0; i < half; i++) {
        spawnRibbon(-10, h * 0.9, 45 + Math.random() * 35, [18, 29]);
      }
      // Right cannon shooting up-left
      for (let i = 0; i < count - half; i++) {
        spawnRibbon(w + 10, h * 0.9, 100 + Math.random() * 35, [18, 29]);
      }
    } else if (origin === 'cannon-left') {
      for (let i = 0; i < count; i++) {
        spawnRibbon(-10, h * 0.9, 40 + Math.random() * 45, [18, 30]);
      }
    } else if (origin === 'cannon-right') {
      for (let i = 0; i < count; i++) {
        spawnRibbon(w + 10, h * 0.9, 95 + Math.random() * 45, [18, 30]);
      }
    } else if (origin === 'center') {
      for (let i = 0; i < count; i++) {
        spawnRibbon(w * 0.5, h * 0.5, Math.random() * 360, [10, 22]);
      }
    } else {
      // Top cascade
      for (let i = 0; i < count; i++) {
        spawnRibbon(Math.random() * w, -20, 250 + Math.random() * 40, [4, 10]);
      }
    }

    this.ribbons.push(...newRibbons);

    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }

  private loop = () => {
    if (!this.ctx || !this.canvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    this.ctx.clearRect(0, 0, w, h);

    const activeRibbons: Ribbon[] = [];

    for (const r of this.ribbons) {
      r.life++;
      r.vy += r.gravity;
      r.vx *= r.friction;
      r.vy *= r.friction;

      // Move head node
      const head = r.nodes[0];
      head.x += r.vx;
      head.y += r.vy;

      // Update trailing nodes (caterpillar spring chain)
      r.swayPhase += r.swaySpeed;
      r.twist += r.twistSpeed;

      const swayOffset = Math.sin(r.swayPhase) * r.swayAmp;

      for (let i = 1; i < r.nodes.length; i++) {
        const prev = r.nodes[i - 1];
        const curr = r.nodes[i];

        // Smooth tension constraint
        const dx = prev.x - curr.x;
        const dy = prev.y - curr.y;

        curr.x += dx * 0.38 + swayOffset * (i * 0.15);
        curr.y += dy * 0.38 + r.gravity * 0.4;
      }

      // Check if ribbon is still visible
      const isAlive = r.life < r.maxLife && head.y < h + 150 && head.x > -200 && head.x < w + 200;
      if (isAlive) {
        activeRibbons.push(r);
        this.drawRibbon(r);
      }
    }

    this.ribbons = activeRibbons;

    if (this.ribbons.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    } else {
      this.isRunning = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.ctx.clearRect(0, 0, w, h);
    }
  };

  private drawRibbon(r: Ribbon) {
    if (!this.ctx || r.nodes.length < 2) return;

    const ctx = this.ctx;
    const nodes = r.nodes;

    // Fade out near end of life
    const remaining = r.maxLife - r.life;
    const alpha = remaining < 40 ? Math.max(0, remaining / 40) : 1;

    for (let i = 0; i < nodes.length - 1; i++) {
      const p1 = nodes[i];
      const p2 = nodes[i + 1];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      if (len < 0.5) continue;

      // Normal vector perpendicular to ribbon direction
      const nx = -dy / len;
      const ny = dx / len;

      // 3D twist projection
      const twistAngle = r.twist + i * 0.32;
      const cosTwist = Math.cos(twistAngle);
      const effectiveWidth = Math.max(1.2, r.width * Math.abs(cosTwist));

      // Front side vs back side shading
      const isFront = cosTwist >= 0;
      ctx.fillStyle = isFront ? r.colorLight : r.colorDark;
      ctx.globalAlpha = (isFront ? 0.95 : 0.8) * alpha;

      const wHalf1 = effectiveWidth * 0.5;
      const nextCos = Math.cos(twistAngle + 0.32);
      const wHalf2 = Math.max(1.2, r.width * Math.abs(nextCos)) * 0.5;

      ctx.beginPath();
      ctx.moveTo(p1.x + nx * wHalf1, p1.y + ny * wHalf1);
      ctx.lineTo(p2.x + nx * wHalf2, p2.y + ny * wHalf2);
      ctx.lineTo(p2.x - nx * wHalf2, p2.y - ny * wHalf2);
      ctx.lineTo(p1.x - nx * wHalf1, p1.y - ny * wHalf1);
      ctx.closePath();
      ctx.fill();

      // Subtle metallic highlight edge on front faces
      if (isFront && effectiveWidth > 4) {
        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha = 0.35 * alpha;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1.x + nx * wHalf1 * 0.7, p1.y + ny * wHalf1 * 0.7);
        ctx.lineTo(p2.x + nx * wHalf2 * 0.7, p2.y + ny * wHalf2 * 0.7);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  }
}

// Global singleton instance
export const ribbonCannons = typeof window !== 'undefined' ? new RibbonCannonsManager() : ({} as RibbonCannonsManager);

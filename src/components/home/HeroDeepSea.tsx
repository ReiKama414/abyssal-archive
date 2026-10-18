'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAppStore } from '@/lib/store';

export const HeroDeepSea: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const settings = useAppStore((s) => s.settings);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth;
    let height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020612, 0.025);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.animationQuality === 'high' ? 2 : 1));
    renderer.setClearColor(0x02050f, 1);
    container.appendChild(renderer.domElement);

    // Deep Sea Volumetric Lighting
    const ambientLight = new THREE.AmbientLight(0x061530, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00f2ff, 3, 40);
    pointLight1.position.set(-6, 8, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xa855f7, 2.5, 40);
    pointLight2.position.set(6, -6, 5);
    scene.add(pointLight2);

    // 1. Deep Sea Marine Snow / Floating Bioluminescent Particles
    const particleCount = settings.animationQuality === 'high' ? 450 : 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 35;
      particlePos[i + 1] = (Math.random() - 0.5) * 35;
      particlePos[i + 2] = (Math.random() - 0.5) * 25;

      particleVel[i] = (Math.random() - 0.5) * 0.005;
      particleVel[i + 1] = Math.random() * 0.008 + 0.003; // Gentle upward drift
      particleVel[i + 2] = (Math.random() - 0.5) * 0.005;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    // Canvas particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(0, 242, 255, 1)');
      grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.6)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const particleTex = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.35,
      map: particleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 2. 3D Bioluminescent Jellyfish Group
    interface JellyfishEntity {
      group: THREE.Group;
      bell: THREE.Mesh;
      tentacles: THREE.Line[];
      baseY: number;
      speed: number;
      pulseOffset: number;
      driftSpeedX: number;
    }

    const jellyEntities: JellyfishEntity[] = [];
    const jellyCount = settings.animationQuality === 'high' ? 5 : 3;

    for (let j = 0; j < jellyCount; j++) {
      const jellyGroup = new THREE.Group();

      // Jellyfish Bell (Dome)
      const bellGeo = new THREE.SphereGeometry(1.4, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const bellMat = new THREE.MeshPhysicalMaterial({
        color: j % 2 === 0 ? 0x00f2ff : 0xa855f7,
        emissive: j % 2 === 0 ? 0x0284c7 : 0x7e22ce,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.1,
        transmission: 0.85, // Glass-like bioluminescent translucency
        transparent: true,
        opacity: 0.75,
        wireframe: false,
      });
      const bell = new THREE.Mesh(bellGeo, bellMat);
      jellyGroup.add(bell);

      // Inner glowing core
      const coreGeo = new THREE.SphereGeometry(0.5, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.y = 0.2;
      jellyGroup.add(core);

      // Tentacles
      const tentacles: THREE.Line[] = [];
      const tentacleCount = 7;
      for (let t = 0; t < tentacleCount; t++) {
        const points: THREE.Vector3[] = [];
        const segCount = 14;
        const angle = (t / tentacleCount) * Math.PI * 2;
        const radius = 1.1;
        const startX = Math.cos(angle) * radius;
        const startZ = Math.sin(angle) * radius;

        for (let s = 0; s < segCount; s++) {
          points.push(new THREE.Vector3(startX, -s * 0.35, startZ));
        }

        const tGeo = new THREE.BufferGeometry().setFromPoints(points);
        const tMat = new THREE.LineBasicMaterial({
          color: j % 2 === 0 ? 0x38bdf8 : 0xd8b4fe,
          transparent: true,
          opacity: 0.65,
          linewidth: 1.5,
        });
        const line = new THREE.Line(tGeo, tMat);
        jellyGroup.add(line);
        tentacles.push(line);
      }

      const posX = (Math.random() - 0.5) * 22;
      const posY = (Math.random() - 0.5) * 14;
      const posZ = -Math.random() * 12 + 2;

      jellyGroup.position.set(posX, posY, posZ);
      jellyGroup.scale.setScalar(0.7 + Math.random() * 0.5);
      scene.add(jellyGroup);

      jellyEntities.push({
        group: jellyGroup,
        bell,
        tentacles,
        baseY: posY,
        speed: 0.6 + Math.random() * 0.4,
        pulseOffset: Math.random() * Math.PI * 2,
        driftSpeedX: (Math.random() - 0.5) * 0.006,
      });
    }

    // 3. Sunken Ancient Ruins Silhouettes in Background
    const ruinsGroup = new THREE.Group();
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x050e1e,
      roughness: 0.9,
      metalness: 0.1,
    });

    for (let r = 0; r < 8; r++) {
      const pillarH = 8 + Math.random() * 12;
      const pillarGeo = new THREE.BoxGeometry(1.6, pillarH, 1.6);
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(-16 + r * 4.8 + (Math.random() - 0.5) * 2, -10 + pillarH / 2, -18);
      pillar.rotation.y = Math.random() * 0.5;
      ruinsGroup.add(pillar);
    }
    scene.add(ruinsGroup);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // 1. Particle drift
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] += particleVel[i];
        positions[i + 1] += particleVel[i + 1];
        positions[i + 2] += particleVel[i + 2];

        // Wrap around bounds
        if (positions[i + 1] > 18) positions[i + 1] = -18;
        if (positions[i] > 18) positions[i] = -18;
        if (positions[i] < -18) positions[i] = 18;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // 2. Jellyfish Swimming & Undulation
      jellyEntities.forEach((jelly) => {
        const t = elapsedTime * jelly.speed + jelly.pulseOffset;
        const pulse = Math.sin(t);

        // Bell contraction pulse
        jelly.bell.scale.set(1 - pulse * 0.12, 1 + pulse * 0.22, 1 - pulse * 0.12);

        // Gentle vertical propulsion + slow horizontal drift
        jelly.group.position.y += Math.sin(t) * 0.012;
        jelly.group.position.x += jelly.driftSpeedX;

        // Wrap horizontal bounds
        if (jelly.group.position.x > 18) jelly.group.position.x = -18;
        if (jelly.group.position.x < -18) jelly.group.position.x = 18;

        // Tentacle wave motion
        jelly.tentacles.forEach((tentacle, tidx) => {
          const tPoints = tentacle.geometry.attributes.position.array as Float32Array;
          const segCount = tPoints.length / 3;

          for (let s = 1; s < segCount; s++) {
            const wave = Math.sin(t * 1.5 - s * 0.4 + tidx) * (s * 0.04);
            tPoints[s * 3] += (wave - tPoints[s * 3] * 0.1) * 0.2;
          }
          tentacle.geometry.attributes.position.needsUpdate = true;
        });
      });

      // Camera subtle drift
      camera.position.x = Math.sin(elapsedTime * 0.15) * 0.8;
      camera.position.y = Math.cos(elapsedTime * 0.2) * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Clean unmount to strictly prevent WebGL memory leaks
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });

      particleTex.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [settings.animationQuality]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      {/* Deep Ocean Vignette & Gradients Overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950 pointer-events-none" />
    </div>
  );
};

# Abyssal Archive

**English** · [繁體中文](./README.zh-TW.md)

> **Dark fantasy card gacha** — daily free pulls, 3D holographic cards, and a browser-local collection archive

<p align="center">
  <img src="./public/logo.png" alt="Abyssal Archive crest" width="160" />
</p>

<p align="center">
  <a href="https://reikama414.vercel.app/">Portfolio</a>
  ·
  <a href="#quick-start">Quick start</a>
  ·
  <a href="#license--rights">License</a>
</p>

---

## Why

A self-contained web experience for browsing and collecting dark fantasy trading cards: permanent series, festival packs, pity counters, and a 3D showcase wall — all running in the browser with local persistence

---

## Highlights

- **414 cards** — four permanent series (72 each) plus nine festival lines (14 each)
- **13 packs** — permanent pools and time-gated festival events
- **Daily free pulls** — Taipei midnight reset · SR / UR / EX pity
- **3D cards** — foil variants, tilt, flip, and full-screen inspect
- **Opening ritual** — pack tear → reveal → results
- **Showcase wall** — pin up to five owned cards on pedestals
- **Local archive** — collection, pity, and history stored on-device

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 · React 19 · TypeScript |
| Style | Tailwind CSS 4 |
| 3D / motion | Three.js · GSAP · canvas-confetti |
| State | Zustand |
| Icons | Lucide |
| Fonts | Cinzel · LXGW WenKai TC · Chiron Hei HK · Oxanium · IBM Plex Mono |

---

## Quick start

Requires Node.js 20+ and npm

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

```bash
npm run build
npm start
npm run lint
```

---

## Play loop

1. **Home** — brand hero and entry into summoning or the compendium
2. **Packs** — pick a series · single / 5 / 10 pull (sticky dock)
3. **Opening** — tear the foil · skip anytime · reveal cards
4. **Results** — inspect in 3D · continue to packs or the showcase
5. **Compendium** — filters, favorites, completion stats, pull history
6. **Showcase** — edit up to five owned cards on display stands

> **Note:** Daily free pulls reset at **00:00 Asia/Taipei**

---

## Project layout

```text
abyssal-archive/
├── public/                 # Static assets · card art · brand marks
├── scripts/                # Data / QA / generation helpers
├── src/
│   ├── app/                # Next.js app shell · layout · page
│   ├── components/         # Home · gacha · cards · collection · modals
│   ├── data/               # Card & pack definitions
│   ├── lib/                # Gacha · storage · audio · store
│   └── types/              # Shared TypeScript types
├── LICENSE
├── README.md
└── README.zh-TW.md
```

---

## Third-party notices

Runtime and tooling libraries keep their own licenses (Next.js, React, Three.js, GSAP, Zustand, Lucide, canvas-confetti, and fonts loaded via `next/font`). Those terms apply only to those packages — not to this project’s original code, brand, copy, or artwork

Original project assets (source, UI design, card pool text, brand marks, and illustrative art in `public/`) remain under the project license below and are **not** MIT / Apache open-source

---

## Links

| | |
| --- | --- |
| GitHub | [ReiKama414/abyssal-archive](https://github.com/ReiKama414/abyssal-archive) |
| Portfolio | [reikama414.vercel.app](https://reikama414.vercel.app/) |
| Author | [ReiKama414](https://github.com/ReiKama414) (Myers) |
| Full license | [LICENSE](./LICENSE) |

---

## License / Rights

Copyright (c) ReiKama414. All rights reserved.

This project is provided for personal viewing and learning only. Without the copyright holder’s written consent, you may not use, copy, modify, distribute, or incorporate it into other projects (commercial or non-commercial)

- [GitHub](https://github.com/ReiKama414/abyssal-archive)
- [Portfolio](https://reikama414.vercel.app/)
- [Full license text](./LICENSE)

---

<sub>Abyssal Archive · ReiKama414 · All rights reserved</sub>

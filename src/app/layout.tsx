import type { Metadata } from 'next';
import {
  Cinzel,
  LXGW_WenKai_TC,
  Chiron_Hei_HK,
  Oxanium,
  IBM_Plex_Mono,
} from 'next/font/google';
import './globals.css';

/**
 * Typography roles (5 fonts — no Noto; texture-matched):
 * - Cinzel           → font-display  Latin brand / pack EN / engraved
 * - LXGW WenKai TC   → font-serif    霞鹜文楷：品牌大標、風味文、儀式語境
 * - Chiron Hei HK    → font-sans     銳利繁中黑體：UI、卡包中文標題、卡名、按鈕
 * - Oxanium          → font-hud      全息 HUD / 稀有度標籤
 * - IBM Plex Mono    → font-mono     保底、倒數、序號、戰力
 */
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['600', '700', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});

const wenkai = LXGW_WenKai_TC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-wenkai',
  display: 'swap',
});

const chironHei = Chiron_Hei_HK({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-chiron-hei',
  display: 'swap',
});

const oxanium = Oxanium({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-oxanium',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ABYSSAL ARCHIVE — 深淵幻藏 | 線上抽卡與3D卡牌收藏',
  description:
    '深淵幻藏 — 暗黑奇幻卡牌召喚。每日免費10抽、3D全息多維卡牌、四大永久系列與節慶限定活動。',
  keywords: [
    '抽卡',
    '3D卡牌',
    '深淵幻藏',
    'ABYSSAL ARCHIVE',
    '全息閃卡',
    'Trading Card Game',
    'Gacha',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-TW"
      className={`dark h-full antialiased ${chironHei.variable} ${wenkai.variable} ${cinzel.variable} ${oxanium.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans min-h-full flex flex-col bg-slate-950 text-slate-100 select-none">
        {children}
      </body>
    </html>
  );
}

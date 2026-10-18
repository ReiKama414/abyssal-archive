'use client';

import React from 'react';
import { Globe } from 'lucide-react';

const GITHUB_URL = 'https://github.com/ReiKama414/abyssal-archive';
const WEBSITE_URL = 'https://reikama414.vercel.app/';

const GitHubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12 2C6.477 2 2 6.586 2 12.253c0 4.53 2.865 8.37 6.839 9.724.5.094.682-.222.682-.482 0-.237-.009-.866-.014-1.7-2.782.617-3.369-1.37-3.369-1.37-.455-1.18-1.11-1.495-1.11-1.495-.908-.635.069-.622.069-.622 1.003.072 1.53 1.053 1.53 1.053.892 1.561 2.341 1.11 2.91.85.092-.662.35-1.11.636-1.366-2.22-.258-4.555-1.137-4.555-5.062 0-1.118.39-2.033 1.03-2.75-.103-.259-.447-1.3.098-2.71 0 0 .84-.275 2.75 1.05A9.36 9.36 0 0 1 12 7.14c.85.004 1.705.117 2.504.343 1.909-1.325 2.747-1.05 2.747-1.05.547 1.41.203 2.451.1 2.71.64.717 1.028 1.632 1.028 2.75 0 3.936-2.339 4.801-4.566 5.054.359.317.679.942.679 1.9 0 1.371-.012 2.477-.012 2.813 0 .263.18.58.688.481A10.04 10.04 0 0 0 22 12.253C22 6.586 17.523 2 12 2Z" />
  </svg>
);

export const SiteFooter: React.FC = () => {
  return (
    <footer className="relative z-10 w-full border-t border-slate-800/70 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[10px] sm:text-[11px] font-mono tracking-wide text-slate-500 text-center sm:text-left">
          © 2025–2026 ReiKama414. All rights reserved.
        </p>

        <div className="flex items-center gap-3">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
          >
            <GitHubIcon className="w-4 h-4" />
          </a>
          <a
            href={WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Personal website"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
          >
            <Globe className="w-4 h-4" strokeWidth={1.75} />
          </a>
        </div>
      </div>
    </footer>
  );
};

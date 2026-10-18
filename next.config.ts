import type { NextConfig } from 'next';

/** Project Pages URL: https://reikama414.github.io/abyssal-archive/ */
const REPO = 'abyssal-archive';
const isGhPages = process.env.GITHUB_PAGES === 'true';
const basePath = isGhPages ? `/${REPO}` : '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;

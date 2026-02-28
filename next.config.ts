import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/LIFES',
  assetPrefix: '/LIFES',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

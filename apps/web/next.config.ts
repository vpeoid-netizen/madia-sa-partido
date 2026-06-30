import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@madia/domain', '@madia/ai', '@madia/maps', '@madia/ui', '@madia/importers'],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;

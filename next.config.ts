import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.sharepoint.com',
      },
      {
        protocol: 'https',
        hostname: 'graph.microsoft.com',
      },
    ],
  },
};

export default nextConfig;

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
      {
        protocol: 'https',
        hostname: '*.office.net',
      },
      {
        protocol: 'https',
        hostname: '*.office365.com',
      },
    ],
  },
};

export default nextConfig;

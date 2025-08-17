import { NextConfig } from 'next';

const config: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/frontend',
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '/frontend',
  experimental: {
    ppr: true,
    inlineCss: true,
    useCache: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_BASE_URL || 'http://app:8000'}/:path*`
      }
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/s/files/**'
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**'
      },
      {
        protocol: (process.env.API_PROTOCOL as 'https' | 'http') || 'http',
        hostname: process.env.API_HOSTNAME || 'app',
        port: process.env.API_PORT || '8000',
        pathname: '/products/**'
      }
    ]
  }
};

export default config;

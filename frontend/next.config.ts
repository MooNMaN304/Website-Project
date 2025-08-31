import { NextConfig } from 'next';
import path from 'path';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables from root directory
dotenvConfig({ path: path.resolve(__dirname, '../.env.local') });
dotenvConfig({ path: path.resolve(__dirname, '../.env') });

const config: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
  experimental: {
    // Removed ppr and useCache to prevent SSR
    inlineCss: true
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // Disable optimization for both development and production
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
        hostname: process.env.API_HOSTNAME || 'localhost',
        port: process.env.API_PORT || '8000',
        pathname: '/products/**'
      }
    ]
  }
};

export default config;

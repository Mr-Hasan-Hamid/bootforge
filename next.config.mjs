import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // only enable in production
  runtimeCaching: [
    // Cache all R2 CDN assets (GIFs, PNGs, ZIPs) — cache first strategy
    {
      urlPattern: /^https:\/\/.*\.r2\.dev\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'r2-assets',
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // Cache Next.js static pages — stale while revalidate
    {
      urlPattern: /^https:\/\/.*\/$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // Cache API responses for 1 hour
    {
      urlPattern: /^https:\/\/.*\/api\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from Cloudflare R2 CDN
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimize images aggressively
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for processed images
  },

  // Add aggressive cache headers for static assets
  async headers() {
    return [
      {
        // Immutable cache for all Next.js static chunks (JS, CSS)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache favicon and static public files for 1 year
        source: '/favicon.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // API routes — cache for 1 hour, allow CDN to cache too
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },

  // Compress responses
  compress: true,

  // Enable React strict mode for better performance warnings
  reactStrictMode: true,

  // Reduce bundle size
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
};

export default withPWA(nextConfig);

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' ? false : false,
  // Force clear old caches
  cleanupOutdatedCaches: true,
  // Exclude problematic build files
  buildExcludes: [
    /middleware-manifest\.json$/, 
    /_buildManifest\.js$/, 
    /_ssgManifest\.js$/,
    /\.map$/,
    /^build-manifest\.json$/
  ],
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  // Fix for build manifest caching issues
  fallbacks: {
    image: '/offline.png',
    document: '/offline.html',
  },
  // More aggressive caching strategy
  mode: 'production',
  // Add cache versioning
  cacheId: `wedding-app-${Date.now()}`,
  // Production-optimized caching with better error handling
  runtimeCaching: [
    {
      urlPattern: /^https?.*\.(png|jpg|jpeg|webp|svg|gif|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /^https?.*\.(js|css|woff2|woff|ttf)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    // Fix for Next.js build manifests
    {
      urlPattern: /\/_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /^https?.*\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'general-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    largePageDataBytes: 128 * 1024, // 128KB
    // Disable ISR memory cache to free up memory for uploads
    isrMemoryCacheSize: 0,
  },
  // Headers for PWA and ngrok compatibility
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
  // Add async redirects
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/login-new',
        permanent: false,
      },
    ];
  },
}

module.exports = withPWA(nextConfig)

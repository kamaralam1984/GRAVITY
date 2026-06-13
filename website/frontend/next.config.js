/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,

  transpilePackages: ['react-leaflet', 'leaflet'],

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@anthropic-ai/sdk',
    ],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  async rewrites() {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'
    const base = API.replace(/\/api$/, '')
    const routes = [
      'auth', 'admin-api', 'families', 'devices', 'geofences', 'sos',
      'check-ins', 'journeys', 'chat', 'driving', 'health', 'notifications',
      'plans', 'emergency-profile', 'support', 'audit', 'coupons', 'payments',
      'ai', 'location', 'subscriptions', 'security-logs', 'social-auth',
    ]
    return routes.flatMap(r => [
      { source: `/${r}`, destination: `${base}/${r}` },
      { source: `/${r}/:path*`, destination: `${base}/${r}/:path*` },
    ])
  },

  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)\\.(svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|otf)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ]
  },
}

module.exports = nextConfig

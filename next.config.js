/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  eslint: {
    // Allow production builds to successfully complete even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to successfully complete even if there are type errors
    ignoreBuildErrors: true,
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development'
    
    // CSP for development (more permissive)
    const devCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://s3.tradingview.com https://*.privy.io",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://steamcommunity-a.akamaihd.net https://avatars.steamstatic.com https://community.cloudflare.steamstatic.com https://cdn.builder.io https://api.qrserver.com https://preview.redd.it https://cdn4.iconfinder.com https://i.pinimg.com https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com https://steamcdn-a.akamaihd.net https://cdn.akamai.steamstatic.com https://community.akamai.steamstatic.com https://cdn.cloudflare.steamstatic.com https://*.steamstatic.com https://ipfs.io https://*.ipfs.dweb.link https://gateway.pinata.cloud",
      "connect-src 'self' http://localhost:3333 https://api.steampowered.com https://api.mainnet-beta.solana.com https://steamcommunity.com https://auth.privy.io https://api.privy.io https://*.privy.io",
      "frame-src https://www.tradingview.com https://steamcommunity.com https://*.privy.io",
      "form-action 'self' https://steamcommunity.com",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'"
    ].join('; ')
    
    // CSP for production (more restrictive but still functional)
    const prodCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://s3.tradingview.com https://*.privy.io",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://steamcommunity-a.akamaihd.net https://avatars.steamstatic.com https://community.cloudflare.steamstatic.com https://cdn.builder.io https://api.qrserver.com https://steamcdn-a.akamaihd.net https://cdn.akamai.steamstatic.com https://community.akamai.steamstatic.com https://cdn.cloudflare.steamstatic.com https://*.steamstatic.com https://ipfs.io https://*.ipfs.dweb.link https://gateway.pinata.cloud",
      "connect-src 'self' https://api.steampowered.com https://api.mainnet-beta.solana.com https://steamcommunity.com https://auth.privy.io https://api.privy.io https://*.privy.io",
      "frame-src https://www.tradingview.com https://steamcommunity.com https://*.privy.io",
      "form-action 'self' https://steamcommunity.com",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: isDev ? devCSP : prodCSP,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url'),
      zlib: require.resolve('browserify-zlib'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      assert: require.resolve('assert'),
      os: require.resolve('os-browserify'),
      path: require.resolve('path-browserify'),
      'process/browser': require.resolve('process/browser'),
    }

    return config
  },
  // Configuration pour les images externes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'steamcommunity-a.akamaihd.net',
        port: '',
        pathname: '/economy/image/**',
      },
      {
        protocol: 'https',
        hostname: 'community.cloudflare.steamstatic.com',
        port: '',
        pathname: '/economy/image/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.steamstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.steamstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: '*.ipfs.dweb.link',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/v1/create-qr-code/**',
      },
    ],
    domains: [
      "community.cloudflare.steamstatic.com",
      "steamcdn-a.akamaihd.net",
      "cdn.akamai.steamstatic.com",
      "community.akamai.steamstatic.com",
      "cdn.cloudflare.steamstatic.com",
      "ipfs.io",
      "gateway.pinata.cloud",
      "api.qrserver.com",
    ],
  },
}

module.exports = nextConfig
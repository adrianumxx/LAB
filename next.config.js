/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Playwright usa 127.0.0.1 mentre `next dev` annuncia localhost — evita warning cross-origin in dev. */
  allowedDevOrigins: ['127.0.0.1'],
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

function exportConfig() {
  if (process.env['ANALYZE'] === 'true') {
    try {
      const withBundleAnalyzer = require('@next/bundle-analyzer')({
        enabled: true,
      })
      return withBundleAnalyzer(nextConfig)
    } catch {
      return nextConfig
    }
  }
  return nextConfig
}

module.exports = exportConfig()

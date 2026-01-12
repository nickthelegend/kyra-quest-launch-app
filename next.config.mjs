/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['pino', 'thread-stream', 'pino-pretty'],
  turbopack: {},
}

export default nextConfig

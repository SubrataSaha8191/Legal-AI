import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "pdfjs-dist"],
  },
  webpack(config) {
    config.resolve ||= {};
    config.resolve.alias ||= {};
    config.resolve.alias['@'] = path.resolve(process.cwd());
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable static optimization to fix reload issues
  output: undefined, // Remove if you had 'export'
  // Ensure proper handling of client-side routing
  trailingSlash: false,
  // Fix asset loading issues
  assetPrefix: undefined,
}

export default nextConfig

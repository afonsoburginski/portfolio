import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build a self-contained server (.next/standalone/server.js) for the Docker image.
  output: "standalone",
  async redirects() {
    return [
      { source: "/dashboard/new", destination: "/dashboard", permanent: false },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Optimized images are immutable per source key (project images get a new
    // key on re-upload), so cache them for a year. This is the Cache-Control
    // max-age the optimizer emits — it lets Cloudflare hold /_next/image at the
    // edge instead of revalidating every 4h (was max-age=14400 → frequent cold
    // re-optimizes). Pair with a Cloudflare cache rule for /_next/image*.
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "framerusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // Cloudflare R2
      { protocol: "https", hostname: "pub-*.r2.dev" },
      { protocol: "https", hostname: "cdn.afonsodev.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "framerusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;

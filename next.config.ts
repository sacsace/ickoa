import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  // Serve uploaded media from volume before public/ static 404s.
  // Gallery page routes (/gallery, /gallery/[slug]) are excluded by file-ext match.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/history/:path*",
          destination: "/api/history/:path*",
        },
        {
          source:
            "/gallery/:file([^/]+\\.(?:jpe?g|png|webp|gif|JPE?G|PNG|WEBP|GIF))",
          destination: "/api/gallery/:file",
        },
      ],
    };
  },
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

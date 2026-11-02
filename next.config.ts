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
  // Serve /history/* from volume via route handler before public/ static 404s.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/history/:path*",
          destination: "/api/history/:path*",
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

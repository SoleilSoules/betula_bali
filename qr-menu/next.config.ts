import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // Skip Next.js image optimization in the deployed build — the
  // upstream nginx already handles caching for /photos/* and the
  // optimizer choked on basePath-prefixed source URLs in production.
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // Include the seeded SQLite + Prisma schema into the serverless
  // bundle so server functions can copy /prisma/dev.db → /tmp at
  // cold start. Without this Next/Vercel strips data files.
  outputFileTracingIncludes: {
    "/**/*": ["./prisma/dev.db", "./prisma/schema.prisma"],
  },
};

export default nextConfig;

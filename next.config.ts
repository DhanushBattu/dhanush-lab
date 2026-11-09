import type { NextConfig } from "next";

// On GitHub Pages the site lives under /<repo-name>; the deploy workflow passes that in.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static export: deploy the /out folder to GitHub Pages, Vercel, Netlify or any static host.
  output: "export",
  basePath,
  images: { unoptimized: true },
  transpilePackages: ["three"],
};

export default nextConfig;

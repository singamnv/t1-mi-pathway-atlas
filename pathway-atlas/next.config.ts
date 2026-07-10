import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  // Static-friendly; data is loaded from /public/data at runtime (fetch) and build time (fs).
  reactStrictMode: true,
};
export default nextConfig;

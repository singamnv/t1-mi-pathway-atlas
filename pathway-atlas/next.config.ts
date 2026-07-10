import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  // Fully static site: every route is SSG. `export` emits a plain `out/` dir
  // that serves on any static host (Amplify WEB platform, no compute needed).
  // Data is loaded from /public/data at runtime (fetch) and build time (fs).
  output: "export",
  // Emit each route as `route/index.html` (not `route.html`) so a static host
  // like Amplify serves `/molecules/` and `/molecule/<id>/` without rewrites.
  trailingSlash: true,
  reactStrictMode: true,
};
export default nextConfig;

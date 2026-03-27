import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Turbopack otherwise picks the nearest lockfile (e.g. ~/bun.lock) as the workspace root,
  // which breaks proxy.ts resolution and can make GET / 404.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;

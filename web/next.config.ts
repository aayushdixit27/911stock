import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.join(__dirname);

const nextConfig: NextConfig = {
  // Turbopack otherwise picks the nearest lockfile (e.g. ~/bun.lock) as the workspace root,
  // which breaks proxy.ts resolution and can make GET / 404.
  turbopack: {
    root: projectRoot,
    // `@import "tailwindcss"` in globals.css must resolve against this app (where node_modules
    // lives). Otherwise resolution can run from the git root and fail with "Can't resolve
    // 'tailwindcss' in '.../911stock'".
    resolveAlias: {
      tailwindcss: path.join(projectRoot, "node_modules/tailwindcss"),
    },
  },
  // Same fix for webpack (used by `next build`): anchor tailwindcss to this package's node_modules.
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      tailwindcss: path.join(projectRoot, "node_modules/tailwindcss"),
    };
    return config;
  },
};

export default nextConfig;

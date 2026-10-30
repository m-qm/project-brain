import type { NextConfig } from "next";
import { join } from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@project-brain/core", "@project-brain/templates"],
  outputFileTracingRoot: join(__dirname, "../.."),
};

export default nextConfig;

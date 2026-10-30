import type { NextConfig } from "next";
import { join } from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@agentkbase/core", "@agentkbase/templates"],
  outputFileTracingRoot: join(__dirname, "../.."),
};

export default nextConfig;

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { join } from "node:path";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ["@agentkbase/core", "@agentkbase/templates", "next-intl"],
  /** Reagraph + R3F: client-only (dynamic import); keep off the server bundle. */
  serverExternalPackages: [
    "reagraph",
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "pdf-lib",
    "@pdf-lib/fontkit",
    "wawoff2",
  ],
  outputFileTracingIncludes: {
    "/[locale]/onboarding/pdf": ["./app/fonts/*.woff2"],
  },
  outputFileTracingRoot: join(__dirname, "../.."),
  webpack: (config) => {
    // three.js optional native deps (dev compile on macOS/Linux)
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    config.resolve.fallback = { ...config.resolve.fallback, canvas: false };
    return config;
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);

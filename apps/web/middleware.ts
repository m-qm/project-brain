import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { WEBSITE_JSON_LD_HASH } from "./lib/site";

const handleI18n = createMiddleware(routing);

function contentSecurityPolicy(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    `'${WEBSITE_JSON_LD_HASH}'`,
    "'strict-dynamic'",
    isDev ? "'unsafe-eval'" : "",
  ].filter(Boolean);

  /** Reagraph (troika-three-text) loads unicode codepoint JSON + font assets from jsDelivr at runtime. */
  const reagraphCdn = "https://cdn.jsdelivr.net";

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    `font-src 'self' ${reagraphCdn} data:`,
    `connect-src 'self' ${reagraphCdn}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "script-src-attr 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

function skipLocale(pathname: string): boolean {
  if (pathname.startsWith("/api")) return true;
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (host === "www.agentkbase.com") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = "agentkbase.com";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  const nonce = btoa(crypto.randomUUID());
  const csp = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("content-security-policy", csp);

  const response = skipLocale(request.nextUrl.pathname)
    ? NextResponse.next({ request: { headers: requestHeaders } })
    : handleI18n(new NextRequest(request, { headers: requestHeaders }));

  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

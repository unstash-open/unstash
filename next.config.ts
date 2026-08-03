import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const scriptSources = ["'self'", "'unsafe-inline'", isDevelopment ? "'unsafe-eval'" : ""]
  .filter(Boolean)
  .join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self' https://vitals.vercel-insights.com",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "object-src 'none'",
  `script-src ${scriptSources}`,
  "style-src 'self' 'unsafe-inline'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;

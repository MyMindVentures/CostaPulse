import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  distDir: ".next-app",
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    const isDevelopment = process.env.NODE_ENV === "development";
    const scriptSources = [
      "'self'",
      "'unsafe-inline'",
      ...(isDevelopment ? ["'unsafe-eval'"] : [])
    ];
    const connectSources = [
      "'self'",
      "https://*.supabase.co",
      "https://*.posthog.com",
      "https://*.sentry.io"
    ];
    const contentSecurityPolicy = `default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: https://images.unsplash.com https://*.supabase.co; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src ${scriptSources.join(" ")}; connect-src ${connectSources.join(" ")}; upgrade-insecure-requests`;

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          },
          { key: "Content-Security-Policy", value: contentSecurityPolicy }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "fbxhevctqrkulmaehrcw.supabase.co" },
      { protocol: "https", hostname: "*.supabase.co" }
    ]
  }
};

export default withNextIntl(nextConfig);

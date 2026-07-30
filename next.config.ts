import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
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
      "https://*.sentry.io",
      "https://tiles.openfreemap.org",
      "https://*.openfreemap.org"
    ];
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https://*.supabase.co https://tiles.openfreemap.org https://*.openfreemap.org",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      `script-src ${scriptSources.join(" ")}`,
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      `connect-src ${connectSources.join(" ")}`,
      "upgrade-insecure-requests"
    ].join("; ");

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
      },
      {
        source: "/shared/credentials/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }
        ]
      },
      {
        source: "/portal/credentials/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "fbxhevctqrkulmaehrcw.supabase.co" },
      { protocol: "https", hostname: "*.supabase.co" }
    ]
  }
};

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN?.trim();

export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: sentryAuthToken,
  silent: !process.env.CI,
  sourcemaps: {
    disable: !sentryAuthToken
  },
  widenClientFileUpload: Boolean(sentryAuthToken)
});

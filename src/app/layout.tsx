import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { ConsentBanner } from "@/features/analytics/consent-banner";
import { PostHogProvider } from "@/features/analytics/posthog-provider";
import {
  BRAND_ASSETS_BUCKET,
  getPublicStorageUrl
} from "@/lib/media/experience-media";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.costapulse.club";

const brandLogoUrl =
  getPublicStorageUrl(BRAND_ASSETS_BUCKET, "logos/CostaPulse Logo.png") ??
  "/brand/costapulse-mark.svg";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "CostaPulse | Exceptional Costa Blanca experiences",
  description:
    "Discover a considered collection of authentic yacht, water and local experiences on Spain's Costa Blanca.",
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: brandLogoUrl, type: "image/png" }],
    shortcut: [{ url: brandLogoUrl, type: "image/png" }],
    apple: [{ url: brandLogoUrl, type: "image/png" }]
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "CostaPulse",
    title: "Exceptional Costa Blanca experiences",
    description: "The Mediterranean, thoughtfully curated.",
    images: [{ url: brandLogoUrl, alt: "CostaPulse" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "CostaPulse | Exceptional Costa Blanca experiences",
    description: "The Mediterranean, thoughtfully curated.",
    images: [brandLogoUrl]
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <PostHogProvider>
            {children}
            <ConsentBanner />
          </PostHogProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

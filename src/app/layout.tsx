import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.costapulse.club";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "CostaPulse | Exceptional Costa Blanca experiences",
  description: "Discover a considered collection of authentic yacht, water and local experiences on Spain's Costa Blanca.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "CostaPulse",
    title: "Exceptional Costa Blanca experiences",
    description: "The Mediterranean, thoughtfully curated."
  },
  twitter: {
    card: "summary_large_image",
    title: "CostaPulse | Exceptional Costa Blanca experiences",
    description: "The Mediterranean, thoughtfully curated."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><NextIntlClientProvider>{children}</NextIntlClientProvider></body>
    </html>
  );
}

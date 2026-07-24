import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.costapulse.club";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CostaPulse",
    template: "%s | CostaPulse"
  },
  description:
    "Premium Costa Blanca experiences, yacht charters, watersports and local adventures.",
  applicationName: "CostaPulse",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    siteName: "CostaPulse",
    url: "/",
    title: "CostaPulse",
    description:
      "Premium Costa Blanca experiences, yacht charters, watersports and local adventures."
  },
  twitter: {
    card: "summary_large_image",
    title: "CostaPulse",
    description:
      "Premium Costa Blanca experiences, yacht charters, watersports and local adventures."
  }
};

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}

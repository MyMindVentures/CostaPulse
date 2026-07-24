import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getMarketingNavContext } from "@/server/auth/marketing-nav";
import { getSiteLogoAsset } from "@/server/repositories/media-assets";

export default async function MarketingLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  const [nav, siteLogo] = await Promise.all([
    getMarketingNavContext(),
    getSiteLogoAsset()
  ]);

  return (
    <AppShell
      audience={nav.audience}
      logoSrc={siteLogo.url}
      logoAlt={siteLogo.alt}
    >
      {children}
    </AppShell>
  );
}

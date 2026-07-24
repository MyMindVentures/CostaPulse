import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { AppShell } from "@/components/layout/AppShell";
import { getMarketingNavContext } from "@/server/auth/marketing-nav";
import { getSiteLogoAsset } from "@/server/repositories/media-assets";
import { getPublishedSiteNavigation } from "@/server/repositories/site-navigation";

/**
 * Shared public chrome loader for marketing + booking surfaces.
 * Lives under features (not presentational components) because it fetches server data.
 */
export async function loadPublicShellProps() {
  const locale = await getLocale();
  const [nav, siteLogo, navigation] = await Promise.all([
    getMarketingNavContext(),
    getSiteLogoAsset(),
    getPublishedSiteNavigation(locale)
  ]);

  return {
    audience: nav.audience,
    logoSrc: siteLogo.url,
    logoAlt: siteLogo.alt,
    navigation
  };
}

export async function PublicAppShell({
  children
}: Readonly<{ children: ReactNode }>) {
  const shell = await loadPublicShellProps();

  return (
    <AppShell
      audience={shell.audience}
      navigation={shell.navigation}
      logoSrc={shell.logoSrc}
      logoAlt={shell.logoAlt}
    >
      {children}
    </AppShell>
  );
}

/**
 * Central marketing navigation config.
 * Labels come from the `Navigation` i18n namespace; hrefs stay here.
 */

export type NavAudience = "guest" | "customer" | "team" | "admin";

export type NavItemId =
  | "experiences"
  | "map"
  | "destinations"
  | "about"
  | "partners";

export type NavItemConfig = {
  id: NavItemId;
  href: string;
  /** i18n key under Navigation.items.* */
  labelKey: NavItemId;
};

export type AccountNavConfig = {
  href: string;
  /** i18n key under Navigation.account.* */
  labelKey: "login" | "account" | "admin";
};

export type CtaNavConfig = {
  href: string;
  /** i18n key under Navigation.cta */
  labelKey: "explore";
};

/** Primary links shared by desktop and mobile navigation. */
export const PRIMARY_NAV_ITEMS: readonly NavItemConfig[] = [
  { id: "experiences", href: "/experiences", labelKey: "experiences" },
  { id: "map", href: "/experiences/map", labelKey: "map" },
  { id: "destinations", href: "/destinations", labelKey: "destinations" },
  { id: "about", href: "/about", labelKey: "about" },
  { id: "partners", href: "/partners", labelKey: "partners" }
] as const;

export const PRIMARY_CTA: CtaNavConfig = {
  href: "/experiences",
  labelKey: "explore"
};

/**
 * Account slot per audience. Guest/customer/team share primary links;
 * only the account entry changes until dedicated portals exist.
 * `/admin` is the existing authenticated surface (no separate login route yet).
 */
export const ACCOUNT_NAV_BY_AUDIENCE: Record<NavAudience, AccountNavConfig> = {
  guest: { href: "/admin", labelKey: "login" },
  customer: { href: "/experiences", labelKey: "account" },
  team: { href: "/admin", labelKey: "account" },
  admin: { href: "/admin", labelKey: "admin" }
};

export function getPrimaryNavItems(
  audience: NavAudience = "guest"
): readonly NavItemConfig[] {
  void audience;
  // Guest-first: all audiences share the same primary marketing links for now.
  return PRIMARY_NAV_ITEMS;
}

export function getAccountNav(
  audience: NavAudience = "guest"
): AccountNavConfig {
  return ACCOUNT_NAV_BY_AUDIENCE[audience];
}

export function getPrimaryCta(audience: NavAudience = "guest"): CtaNavConfig {
  void audience;
  return PRIMARY_CTA;
}

/**
 * Active-route matching for marketing nav.
 * `/experiences` matches itself and `/experiences/[slug]`, but not `/experiences/map`.
 */
export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  if (pathname === href) {
    return true;
  }

  if (href === "/experiences") {
    if (
      pathname === "/experiences/map" ||
      pathname.startsWith("/experiences/map/")
    ) {
      return false;
    }
    return pathname.startsWith("/experiences/");
  }

  return pathname.startsWith(`${href}/`);
}

/**
 * Audience + account slot helpers and active-route matching for marketing nav.
 * Primary link labels/hrefs come from site_navigation_* tables via the repository.
 */

export type NavAudience = "guest" | "customer" | "team" | "admin";

export type AccountNavConfig = {
  href: string;
  /** i18n key under Navigation.account.* */
  labelKey: "login" | "account" | "admin";
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

export function getAccountNav(
  audience: NavAudience = "guest"
): AccountNavConfig {
  return ACCOUNT_NAV_BY_AUDIENCE[audience];
}

/**
 * Active-route matching for marketing nav hrefs.
 * `/experiences` matches itself and `/experiences/[slug]`, but not `/experiences/map`
 * unless `includeMap` is true (used for parent dropdown highlighting).
 */
export function isNavHrefActive(
  href: string,
  pathname: string,
  options?: { includeMap?: boolean }
): boolean {
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
      return options?.includeMap === true;
    }
    return pathname.startsWith("/experiences/");
  }

  return pathname.startsWith(`${href}/`);
}

/** @deprecated Prefer isNavHrefActive */
export function isNavItemActive(href: string, pathname: string): boolean {
  return isNavHrefActive(href, pathname);
}

export function isNavItemTreeActive(
  item: { href: string; children?: readonly { href: string }[] },
  pathname: string
): boolean {
  if (item.children && item.children.length > 0) {
    if (item.children.some((child) => isNavHrefActive(child.href, pathname))) {
      return true;
    }
    return isNavHrefActive(item.href, pathname, { includeMap: true });
  }

  return isNavHrefActive(item.href, pathname);
}

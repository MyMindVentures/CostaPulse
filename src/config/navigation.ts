/**
 * Audience + account slot helpers and active-route matching for marketing nav.
 * Primary link labels/hrefs come from site_navigation_* tables via the repository.
 */

export type NavAudience = "guest" | "customer" | "team" | "admin";

export type UserRole = import("@/types/database").Enums<"app_role">;

export type NavigationItem = {
  labelKey: string;
  href: string;
  icon?: import("react").ComponentType<{ "aria-hidden"?: boolean }>;
  roles?: readonly UserRole[];
  children?: readonly NavigationItem[];
};

export const DASHBOARD_NAVIGATION = {
  account: [
    { labelKey: "overview", href: "/account" },
    { labelKey: "bookings", href: "/account/bookings" }
  ],
  partner: [{ labelKey: "overview", href: "/partner" }],
  admin: [
    { labelKey: "overview", href: "/admin" },
    { labelKey: "experiences", href: "/admin/experiences" },
    { labelKey: "media", href: "/admin/media" },
    { labelKey: "partners", href: "/admin/partners" },
    { labelKey: "locations", href: "/admin/locations" },
    { labelKey: "team", href: "/admin/team" },
    { labelKey: "bookings", href: "/admin/bookings" },
    { labelKey: "calendar", href: "/admin/calendar" },
    { labelKey: "customers", href: "/admin/customers" }
  ]
} as const satisfies Record<string, readonly NavigationItem[]>;

export type AdminDashboardNavKey =
  (typeof DASHBOARD_NAVIGATION.admin)[number]["labelKey"];

const adminNavHrefBySection = {
  overview: "/admin",
  experiences: "/admin/experiences",
  media: "/admin/media",
  partners: "/admin/partners",
  locations: "/admin/locations",
  team: "/admin/team",
  bookings: "/admin/bookings",
  calendar: "/admin/calendar",
  customers: "/admin/customers"
} as const;

export function getAdminDashboardNavItems(
  sections: readonly (keyof typeof adminNavHrefBySection)[]
): NavigationItem[] {
  const allowed = new Set(
    sections.map((section) => adminNavHrefBySection[section])
  );
  return DASHBOARD_NAVIGATION.admin.filter((item) => allowed.has(item.href));
}

export type AccountNavConfig = {
  href: string;
  /** i18n key under Navigation.account.* */
  labelKey: "login" | "account" | "admin";
};

/**
 * Account slot per audience. Guest/customer/team share primary links;
 * only the account entry changes until dedicated portals exist.
 */
export const ACCOUNT_NAV_BY_AUDIENCE: Record<NavAudience, AccountNavConfig> = {
  guest: { href: "/login", labelKey: "login" },
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

  // Dashboard section roots should not remain active on nested pages.
  if (href === "/admin" || href === "/account" || href === "/partner") {
    return pathname === href;
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

import type { NavAudience } from "@/config/navigation";
import type { Enums } from "@/types/database";

export type AppRole = Enums<"app_role">;

const adminRoles = new Set<AppRole>([
  "operations_staff",
  "customer_support",
  "finance_manager",
  "content_manager",
  "administrator",
  "super_administrator"
]);

const teamRoles = new Set<AppRole>([
  "experience_provider",
  "team_member",
  "partner"
]);

/** Mirrors admin-api / RPC role gates for operations dashboard sections. */
export type AdminNavSection =
  | "overview"
  | "bookings"
  | "calendar"
  | "customers";

const adminNavRoles: Record<AdminNavSection, ReadonlySet<AppRole>> = {
  overview: adminRoles,
  bookings: new Set<AppRole>([
    "operations_staff",
    "customer_support",
    "finance_manager",
    "administrator",
    "super_administrator"
  ]),
  calendar: new Set<AppRole>([
    "operations_staff",
    "customer_support",
    "content_manager",
    "administrator",
    "super_administrator"
  ]),
  customers: new Set<AppRole>([
    "operations_staff",
    "customer_support",
    "finance_manager",
    "administrator",
    "super_administrator"
  ])
};

const slotMutationRoles = new Set<AppRole>([
  "operations_staff",
  "administrator",
  "super_administrator"
]);

const bookingStatusMutationRoles = new Set<AppRole>([
  "operations_staff",
  "customer_support",
  "administrator",
  "super_administrator"
]);

export function isAdminRole(role: AppRole) {
  return adminRoles.has(role);
}

export function canAccessAdminArea(roles: readonly AppRole[]) {
  return roles.some((role) => isAdminRole(role));
}

export function isTeamRole(role: AppRole) {
  return teamRoles.has(role);
}

function hasAnyRole(
  roles: readonly AppRole[],
  allowed: ReadonlySet<AppRole>
): boolean {
  return roles.some((role) => allowed.has(role));
}

export function canAccessAdminSection(
  roles: readonly AppRole[],
  section: AdminNavSection
): boolean {
  return hasAnyRole(roles, adminNavRoles[section]);
}

export function canMutateAdminSlots(roles: readonly AppRole[]): boolean {
  return hasAnyRole(roles, slotMutationRoles);
}

export function canMutateBookingStatus(roles: readonly AppRole[]): boolean {
  return hasAnyRole(roles, bookingStatusMutationRoles);
}

export function filterAdminNavSections(
  roles: readonly AppRole[],
  sections: readonly AdminNavSection[]
): AdminNavSection[] {
  return sections.filter((section) => canAccessAdminSection(roles, section));
}

/**
 * Maps authenticated roles to a navbar audience.
 * Precedence: admin → team → customer.
 */
export function resolveNavAudience(
  roles: readonly AppRole[] | null | undefined
): NavAudience {
  if (!roles || roles.length === 0) {
    return "customer";
  }

  if (canAccessAdminArea(roles)) {
    return "admin";
  }

  if (roles.some((role) => isTeamRole(role))) {
    return "team";
  }

  return "customer";
}

/** Destination after a successful password sign-in. */
export function getPostLoginPath(
  roles: readonly AppRole[] | null | undefined
): string {
  const audience = resolveNavAudience(roles);
  if (audience === "admin") return "/admin";
  if (audience === "team") return "/partner";
  return "/account";
}

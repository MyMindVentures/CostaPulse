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

export function isAdminRole(role: AppRole) {
  return adminRoles.has(role);
}

export function canAccessAdminArea(roles: readonly AppRole[]) {
  return roles.some((role) => isAdminRole(role));
}

export function isTeamRole(role: AppRole) {
  return teamRoles.has(role);
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

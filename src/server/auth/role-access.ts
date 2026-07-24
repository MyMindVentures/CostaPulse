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

export function isAdminRole(role: AppRole) {
  return adminRoles.has(role);
}

export function canAccessAdminArea(roles: readonly AppRole[]) {
  return roles.some((role) => isAdminRole(role));
}

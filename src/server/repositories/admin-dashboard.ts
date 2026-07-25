import "server-only";

import { AdminApiError } from "@/server/admin/schemas";
import {
  fetchAdminDashboardOverview,
  type AdminDashboardOverview
} from "@/server/repositories/admin-ops";

export type AdminDashboardSnapshot = {
  dataConnected: boolean;
  errorMessage: string | null;
  overview: AdminDashboardOverview | null;
};

export async function getAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  try {
    const overview = await fetchAdminDashboardOverview();
    return {
      dataConnected: true,
      errorMessage: null,
      overview
    };
  } catch (error) {
    const message =
      error instanceof AdminApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unable to load dashboard overview";
    return {
      dataConnected: false,
      errorMessage: message,
      overview: null
    };
  }
}

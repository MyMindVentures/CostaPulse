import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/server/repositories/admin-ops", () => ({
  fetchAdminDashboardOverview: vi.fn()
}));

import { AdminApiError } from "@/server/admin/schemas";
import { fetchAdminDashboardOverview } from "@/server/repositories/admin-ops";
import { getAdminDashboardSnapshot } from "./admin-dashboard";

describe("getAdminDashboardSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a connected snapshot when overview loads", async () => {
    const overview = {
      period: { from: "2026-07-01", to: "2026-07-25" },
      bookings_total: 1,
      bookings_confirmed: 1,
      pending_manual_confirmation: 0,
      paid_revenue_minor: 100,
      refunds_minor: 0,
      upcoming_slots: 0,
      failed_payments: 0,
      customers_total: 1,
      partners_active: 1,
      reviews_pending: 0
    };
    vi.mocked(fetchAdminDashboardOverview).mockResolvedValue(overview);

    await expect(getAdminDashboardSnapshot()).resolves.toEqual({
      dataConnected: true,
      errorMessage: null,
      overview
    });
  });

  it("surfaces AdminApiError messages when overview fails", async () => {
    vi.mocked(fetchAdminDashboardOverview).mockRejectedValue(
      new AdminApiError("Authentication required", 401)
    );

    await expect(getAdminDashboardSnapshot()).resolves.toEqual({
      dataConnected: false,
      errorMessage: "Authentication required",
      overview: null
    });
  });
});

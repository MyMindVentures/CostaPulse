import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/server/admin/api-client", () => ({
  callAdminApi: vi.fn()
}));

import { callAdminApi } from "@/server/admin/api-client";
import { fetchAdminBookings, fetchAdminDashboardOverview } from "./admin-ops";

describe("admin-ops repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests dashboard overview through the admin API", async () => {
    const overview = { bookings_total: 3 };
    vi.mocked(callAdminApi).mockResolvedValue(overview);

    await expect(
      fetchAdminDashboardOverview({ from: "a", to: "b" })
    ).resolves.toEqual(overview);

    expect(callAdminApi).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          action: "dashboard_overview",
          from: "a",
          to: "b"
        }
      })
    );
  });

  it("maps booking list query params into the admin API body", async () => {
    const page = { items: [], page: 1, page_size: 25, total: 0 };
    vi.mocked(callAdminApi).mockResolvedValue(page);

    await expect(
      fetchAdminBookings({
        page: 2,
        pageSize: 10,
        search: "boat",
        status: "confirmed"
      })
    ).resolves.toEqual(page);

    expect(callAdminApi).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          action: "list_bookings",
          page: 2,
          page_size: 10,
          search: "boat",
          status: "confirmed"
        })
      })
    );
  });
});

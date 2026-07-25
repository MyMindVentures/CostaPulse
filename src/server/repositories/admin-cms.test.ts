import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/server/admin/api-client", () => ({
  callAdminApi: vi.fn()
}));

import { callAdminApi } from "@/server/admin/api-client";
import { fetchAdminExperiences, fetchAdminMedia } from "./admin-cms";

describe("admin-cms repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists experiences through the admin API", async () => {
    vi.mocked(callAdminApi).mockResolvedValue([
      {
        id: "11111111-1111-4111-8111-111111111111",
        slug: "sunset-cruise",
        title: "Sunset Cruise",
        status: "draft",
        variants_count: 1,
        locations_count: 1,
        media_count: 0
      }
    ]);

    const rows = await fetchAdminExperiences({ status: "draft" });

    expect(callAdminApi).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          action: "list_experiences",
          status: "draft"
        })
      })
    );
    expect(rows[0]?.slug).toBe("sunset-cruise");
  });

  it("lists media through the admin API", async () => {
    vi.mocked(callAdminApi).mockResolvedValue({
      items: [],
      page: 1,
      page_size: 24,
      total: 0
    });

    const page = await fetchAdminMedia({ usage: "unused", pageSize: 24 });

    expect(callAdminApi).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          action: "list_media",
          usage: "unused",
          page_size: 24
        })
      })
    );
    expect(page.total).toBe(0);
  });
});

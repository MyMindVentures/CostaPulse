import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminSessionContext } from "./admin";

describe("getAdminSessionContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports missing config when the server client is unavailable", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);

    await expect(getAdminSessionContext()).resolves.toEqual({
      status: "missing_config"
    });
  });

  it("reports unauthenticated when no user session exists", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } })
      }
    } as never);

    await expect(getAdminSessionContext()).resolves.toEqual({
      status: "unauthenticated"
    });
  });
});

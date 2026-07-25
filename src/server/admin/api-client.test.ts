import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminApiError } from "./schemas";
import { callAdminApi } from "./api-client";

describe("callAdminApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("throws when Supabase is not configured", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);

    await expect(
      callAdminApi({
        body: { action: "reference_data" },
        schema: z.object({})
      })
    ).rejects.toEqual(new AdminApiError("Supabase is not configured", 503));
  });
});

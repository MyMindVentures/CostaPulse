import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  })
}));

vi.mock("next/navigation", () => ({
  redirect
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAreaAccess } from "./protected-area";

describe("requireAreaAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login when Supabase is not configured", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);

    await expect(requireAreaAccess("admin")).rejects.toThrow(
      "redirect:/login?auth=required"
    );
  });

  it("returns roles when an admin caller is authorized", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } }
        })
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ role: "operations_staff" }],
            error: null
          })
        })
      })
    } as never);

    await expect(requireAreaAccess("admin")).resolves.toEqual({
      userId: "user-1",
      roles: ["operations_staff"]
    });
  });
});

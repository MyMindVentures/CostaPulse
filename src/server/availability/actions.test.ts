import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/server/auth/protected-area", () => ({
  requireAreaAccess: vi.fn().mockResolvedValue({
    userId: "00000000-0000-4000-8000-000000000001"
  })
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { bulkBlockTeamMemberDateRangeAction } from "./actions";

describe("availability server actions", () => {
  const insert = vi.fn();
  const rpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    rpc.mockResolvedValue({ data: [], error: null });
    insert.mockResolvedValue({ error: null });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      rpc,
      from: vi.fn(() => ({ insert }))
    } as never);
  });

  it("creates one all-day block per date through a single secured insert", async () => {
    await expect(
      bulkBlockTeamMemberDateRangeAction({
        team_member_id: "00000000-0000-4000-8000-000000000002",
        start_date: "2026-08-10",
        end_date: "2026-08-12",
        timezone: "Europe/Madrid",
        public_title: "Unavailable for new requests",
        visibility: "private"
      })
    ).resolves.toEqual({ ok: true });

    expect(rpc).toHaveBeenCalledTimes(3);
    expect(insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          entry_type: "manual_block",
          status: "unavailable",
          is_all_day: true
        })
      ])
    );
    expect(insert.mock.calls[0]?.[0]).toHaveLength(3);
  });

  it("rejects inverted or oversized ranges before mutation", async () => {
    await expect(
      bulkBlockTeamMemberDateRangeAction({
        team_member_id: "00000000-0000-4000-8000-000000000002",
        start_date: "2026-09-01",
        end_date: "2026-08-01",
        timezone: "Europe/Madrid",
        public_title: "Unavailable",
        visibility: "private"
      })
    ).resolves.toMatchObject({ ok: false });
    expect(insert).not.toHaveBeenCalled();
  });
});

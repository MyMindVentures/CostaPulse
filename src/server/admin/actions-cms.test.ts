import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

vi.mock("@/server/auth/protected-area", () => ({
  requireAreaAccess: vi.fn()
}));

vi.mock("@/server/repositories/admin-cms", () => ({
  upsertAdminExperience: vi.fn(),
  upsertAdminVariant: vi.fn(),
  replaceAdminExperienceCollection: vi.fn(),
  upsertAdminAddon: vi.fn(),
  upsertAdminLocation: vi.fn(),
  upsertAdminPartner: vi.fn(),
  upsertAdminTeamMember: vi.fn(),
  replaceAdminTeamCollection: vi.fn(),
  upsertAdminMediaAsset: vi.fn(),
  linkAdminMediaToScope: vi.fn(),
  deleteAdminMedia: vi.fn(),
  createAdminSignedUpload: vi.fn()
}));

import { requireAreaAccess } from "@/server/auth/protected-area";
import {
  deleteMediaAction,
  publishExperienceAction,
  upsertExperienceAction
} from "./actions-cms";

describe("upsertExperienceAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects callers without content mutation permission", async () => {
    vi.mocked(requireAreaAccess).mockResolvedValue({
      userId: "user-1",
      roles: ["operations_staff"]
    });

    await expect(
      upsertExperienceAction({
        slug: "sunset-cruise",
        title: "Sunset Cruise",
        timezone: "Europe/Madrid",
        duration_minutes: 120,
        base_capacity: 8,
        base_currency: "EUR",
        manual_confirmation_required: true,
        mentor_required: false,
        is_featured: false,
        sort_order: 0,
        status: "draft",
        highlights: [],
        inclusions: []
      })
    ).resolves.toEqual({ ok: false, message: "Forbidden", status: 403 });
  });

  it("rejects invalid experience payloads", async () => {
    vi.mocked(requireAreaAccess).mockResolvedValue({
      userId: "user-1",
      roles: ["content_manager"]
    });

    await expect(
      upsertExperienceAction({
        slug: "BAD SLUG",
        title: "Sunset Cruise",
        timezone: "Europe/Madrid",
        duration_minutes: 120,
        base_capacity: 8,
        base_currency: "EUR",
        manual_confirmation_required: true,
        mentor_required: false,
        is_featured: false,
        sort_order: 0,
        status: "draft",
        highlights: [],
        inclusions: []
      })
    ).resolves.toEqual({ ok: false, message: "Invalid experience payload" });
  });
});

describe("publishExperienceAction", () => {
  it("rejects callers without content mutation permission", async () => {
    vi.mocked(requireAreaAccess).mockResolvedValue({
      userId: "user-1",
      roles: ["customer_support"]
    });

    await expect(
      publishExperienceAction({
        id: "11111111-1111-4111-8111-111111111111",
        status: "published"
      })
    ).resolves.toEqual({ ok: false, message: "Forbidden", status: 403 });
  });
});

describe("deleteMediaAction", () => {
  it("rejects callers without delete permission", async () => {
    vi.mocked(requireAreaAccess).mockResolvedValue({
      userId: "user-1",
      roles: ["operations_staff"]
    });

    await expect(
      deleteMediaAction({
        id: "11111111-1111-4111-8111-111111111111"
      })
    ).resolves.toEqual({ ok: false, message: "Forbidden", status: 403 });
  });
});

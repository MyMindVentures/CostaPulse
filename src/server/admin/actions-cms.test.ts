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
  createAdminSignedUpload: vi.fn(),
  prepareAdminMediaUpload: vi.fn(),
  finalizeAdminMediaUpload: vi.fn(),
  replaceAdminMediaPlacement: vi.fn(),
  detachAdminMediaPlacement: vi.fn(),
  setAdminMediaPrimary: vi.fn()
}));

import { requireAreaAccess } from "@/server/auth/protected-area";
import {
  createSignedUploadAction,
  deleteMediaAction,
  prepareMediaUploadAction,
  publishExperienceAction,
  upsertMediaAssetAction,
  upsertExperienceAction
} from "./actions-cms";
import {
  prepareAdminMediaUpload,
  upsertAdminMediaAsset
} from "@/server/repositories/admin-cms";

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

describe("upsertMediaAssetAction", () => {
  const id = "11111111-1111-4111-8111-111111111111";

  it("rejects operations staff server-side", async () => {
    vi.mocked(requireAreaAccess).mockResolvedValue({
      userId: "user-1",
      roles: ["operations_staff"]
    });
    await expect(
      upsertMediaAssetAction({ id, payload: { title: "Title" } })
    ).resolves.toEqual({ ok: false, message: "Forbidden", status: 403 });
  });

  it("rejects mass assignment and invalid metadata", async () => {
    vi.mocked(requireAreaAccess).mockResolvedValue({
      userId: "user-1",
      roles: ["content_manager"]
    });
    await expect(
      upsertMediaAssetAction({ id, payload: { storage_path: "changed" } })
    ).resolves.toEqual({ ok: false, message: "Invalid media payload" });
    await expect(
      upsertMediaAssetAction({ id, payload: { focal_x: 101 } })
    ).resolves.toEqual({ ok: false, message: "Invalid media payload" });
  });

  it("trims metadata and returns the updated asset", async () => {
    vi.mocked(requireAreaAccess).mockResolvedValue({
      userId: "user-1",
      roles: ["content_manager"]
    });
    const asset = { id, asset_key: "hero" } as never;
    vi.mocked(upsertAdminMediaAsset).mockResolvedValue(asset);
    await expect(
      upsertMediaAssetAction({
        id,
        payload: { title: "  Hero  ", caption: " " }
      })
    ).resolves.toEqual({ ok: true, data: asset });
    expect(upsertAdminMediaAsset).toHaveBeenCalledWith({
      id,
      payload: { title: "Hero", caption: null }
    });
  });
});

describe("createSignedUploadAction", () => {
  it("rejects non admin-documents buckets", async () => {
    vi.mocked(requireAreaAccess).mockResolvedValue({
      userId: "user-1",
      roles: ["content_manager"]
    });

    await expect(
      createSignedUploadAction({
        bucket: "experience-media",
        path: "kayak/hero/file.jpg"
      })
    ).resolves.toEqual({
      ok: false,
      message:
        "Only admin-documents signed uploads are allowed from this action"
    });
  });
});

describe("prepareMediaUploadAction", () => {
  it("rejects callers without content mutation permission", async () => {
    vi.mocked(requireAreaAccess).mockResolvedValue({
      userId: "user-1",
      roles: ["operations_staff"]
    });

    await expect(
      prepareMediaUploadAction({
        entityType: "experience",
        entityId: "11111111-1111-4111-8111-111111111111",
        usage: "hero",
        originalFilename: "hero.jpg",
        mimeType: "image/jpeg",
        byteSize: 1024
      })
    ).resolves.toEqual({ ok: false, message: "Forbidden", status: 403 });
  });

  it("forwards prepared upload metadata for content managers", async () => {
    vi.mocked(requireAreaAccess).mockResolvedValue({
      userId: "user-1",
      roles: ["content_manager"]
    });
    vi.mocked(prepareAdminMediaUpload).mockResolvedValue({
      bucket: "experience-media",
      storage_path: "kayak-mentor/hero/kayak-mentor-hero-abc.jpg",
      generated_filename: "kayak-mentor-hero-abc.jpg",
      signedUrl: "https://example.test/upload"
    } as never);

    await expect(
      prepareMediaUploadAction({
        entityType: "experience",
        entityId: "11111111-1111-4111-8111-111111111111",
        usage: "hero",
        originalFilename: "hero.jpg",
        mimeType: "image/jpeg",
        byteSize: 1024
      })
    ).resolves.toMatchObject({ ok: true });
  });
});

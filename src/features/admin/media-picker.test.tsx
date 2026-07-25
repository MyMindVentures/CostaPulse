/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminMediaAsset } from "@/server/admin/schemas";
import { MediaLibraryClient } from "./media-picker";
import { upsertMediaAssetAction } from "@/server/admin/actions-cms";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

vi.mock("@/server/admin/actions-cms", () => ({
  deleteMediaAction: vi.fn(),
  detachMediaPlacementAction: vi.fn(),
  finalizeMediaUploadAction: vi.fn(),
  linkMediaToScopeAction: vi.fn(),
  prepareMediaUploadAction: vi.fn(),
  replaceMediaPlacementAction: vi.fn(),
  setMediaPrimaryAction: vi.fn(),
  upsertMediaAssetAction: vi.fn()
}));

afterEach(() => cleanup());

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(upsertMediaAssetAction).mockResolvedValue({ ok: true });
});

const labels = {
  upload: "Upload",
  delete: "Delete",
  save: "Save",
  search: "Search",
  filterType: "Type",
  filterUsage: "Usage",
  used: "Used",
  unused: "Unused",
  all: "All"
};

function mediaAsset(
  id: string,
  assetKey: string,
  overrides: Partial<AdminMediaAsset> = {}
): AdminMediaAsset {
  return {
    id,
    bucket_id: "experience-media",
    storage_path: `${assetKey}.jpg`,
    asset_key: assetKey,
    media_type: "image",
    tags: [],
    used_by: [],
    ...overrides
  };
}

function mediaList(items: AdminMediaAsset[]) {
  return {
    items,
    page: 1,
    page_size: 48,
    total: items.length
  };
}

describe("MediaLibraryClient", () => {
  it("replaces stale client items when server-side filters return new results", () => {
    const first = mediaAsset(
      "11111111-1111-4111-8111-111111111111",
      "first-asset"
    );
    const second = mediaAsset(
      "22222222-2222-4222-8222-222222222222",
      "filtered-asset"
    );
    const view = render(
      <MediaLibraryClient
        key="unfiltered"
        initial={mediaList([first])}
        labels={labels}
      />
    );

    expect(screen.getByText("first-asset")).toBeInTheDocument();

    view.rerender(
      <MediaLibraryClient
        key="filtered"
        initial={mediaList([second])}
        labels={labels}
      />
    );

    expect(screen.getByText("filtered-asset")).toBeInTheDocument();
    expect(screen.queryByText("first-asset")).not.toBeInTheDocument();
  });

  it("updates metadata without silently publishing a private archived asset", async () => {
    const archived = mediaAsset(
      "33333333-3333-4333-8333-333333333333",
      "archived-asset",
      {
        title: "Archived asset",
        status: "archived",
        visibility: "private"
      }
    );
    render(
      <MediaLibraryClient initial={mediaList([archived])} labels={labels} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Updated title" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(upsertMediaAssetAction).toHaveBeenCalledWith({
        id: archived.id,
        payload: {
          title: "Updated title",
          alt_text: "",
          caption: "",
          tags: []
        }
      })
    );
  });
});

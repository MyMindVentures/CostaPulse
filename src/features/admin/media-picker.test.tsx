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
import {
  deleteMediaAction,
  upsertMediaAssetAction
} from "@/server/admin/actions-cms";

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
  all: "All",
  deleteTitle: "Delete media asset?",
  deleteDescription:
    "This permanently deletes the file and its media record. This action cannot be undone.",
  deleteInUse: "This media asset cannot be deleted because it is still in use.",
  deleteCancel: "Cancel",
  deleteConfirm: "Delete asset",
  deleteSuccess: "Media asset deleted.",
  editTitle: "Edit media asset",
  edit: "Edit",
  cancel: "Cancel",
  saveChanges: "Save changes",
  updateSuccess: "Media asset updated successfully.",
  updateError: "The media asset could not be updated.",
  discard: "You have unsaved changes. Discard them?"
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
        canDelete
        canEdit
      />
    );

    expect(screen.getByText("first-asset")).toBeInTheDocument();

    view.rerender(
      <MediaLibraryClient
        key="filtered"
        initial={mediaList([second])}
        labels={labels}
        canDelete
        canEdit
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
      <MediaLibraryClient
        initial={mediaList([archived])}
        labels={labels}
        canDelete
        canEdit
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Updated title" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(upsertMediaAssetAction).toHaveBeenCalledWith({
        id: archived.id,
        payload: expect.objectContaining({
          title: "Updated title",
          alt_text: null,
          caption: null,
          tags: [],
          status: "archived",
          visibility: "private"
        })
      })
    );
  });
  it("confirms and removes an unused asset without refreshing", async () => {
    const asset = mediaAsset(
      "44444444-4444-4444-8444-444444444444",
      "unused-asset",
      { title: "Sunset photo" }
    );
    vi.mocked(deleteMediaAction).mockResolvedValue({ ok: true });
    render(
      <MediaLibraryClient
        initial={mediaList([asset])}
        labels={labels}
        canDelete
        canEdit
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Delete: Sunset photo" })
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Sunset photo");
    expect(screen.getByText(labels.deleteDescription)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete asset" }));

    await waitFor(() =>
      expect(deleteMediaAction).toHaveBeenCalledWith({ id: asset.id })
    );
    await waitFor(() =>
      expect(screen.queryByText("Sunset photo")).not.toBeInTheDocument()
    );
  });

  it("hides delete actions from roles without permission", () => {
    const asset = mediaAsset(
      "55555555-5555-4555-8555-555555555555",
      "protected-asset"
    );
    render(
      <MediaLibraryClient
        initial={mediaList([asset])}
        labels={labels}
        canDelete={false}
        canEdit
      />
    );

    expect(
      screen.queryByRole("button", { name: /Delete:/ })
    ).not.toBeInTheDocument();
  });
});

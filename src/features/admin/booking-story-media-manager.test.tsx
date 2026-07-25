import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BookingFootageUploadPolicy } from "@/server/repositories/admin-booking-stories";
import { BookingStoryMediaManager } from "./booking-story-media-manager";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() })
}));

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: vi.fn(() => null)
}));

vi.mock("@/server/admin/actions-booking-stories", () => ({
  attachUploadedBookingStoryMediaAction: vi.fn(),
  removeBookingStoryMediaAction: vi.fn(),
  updateBookingStoryMediaAction: vi.fn()
}));

vi.mock("@/server/admin/actions-cms", () => ({
  upsertMediaAssetAction: vi.fn()
}));

function media(id: string, altText: string, displayOrder: number) {
  return {
    id,
    booking_story_id: "11111111-1111-4111-8111-111111111111",
    media_asset_id: id,
    media_role: "gallery",
    caption: null,
    display_order: displayOrder,
    is_primary: false,
    is_active: true,
    created_at: "2026-07-25T12:00:00Z",
    updated_at: "2026-07-25T12:00:00Z",
    asset: {
      id,
      bucketId: "booking-footage",
      storagePath: `stories/story/${id}.jpg`,
      mediaType: "image",
      mimeType: "image/jpeg",
      altText,
      width: 1200,
      height: 800
    },
    signedUrl: `https://example.test/${id}.jpg`
  };
}

describe("BookingStoryMediaManager", () => {
  it("synchronizes refreshed server media into its local list", () => {
    const first = media(
      "22222222-2222-4222-8222-222222222222",
      "First image",
      0
    );
    const second = media(
      "33333333-3333-4333-8333-333333333333",
      "Uploaded image",
      1
    );
    const props = {
      storyId: "11111111-1111-4111-8111-111111111111",
      uploadPolicy: {
        bucket: "booking-footage",
        fileSizeLimit: 524288000,
        allowedMimeTypes: ["image/jpeg"]
      }
    } satisfies {
      storyId: string;
      uploadPolicy: BookingFootageUploadPolicy;
    };

    const { rerender } = render(
      <BookingStoryMediaManager {...props} initialMedia={[first] as never} />
    );
    expect(screen.getByAltText("First image")).toBeInTheDocument();
    expect(screen.queryByAltText("Uploaded image")).not.toBeInTheDocument();

    rerender(
      <BookingStoryMediaManager
        {...props}
        initialMedia={[first, second] as never}
      />
    );

    expect(screen.getByAltText("Uploaded image")).toBeInTheDocument();
  });
});

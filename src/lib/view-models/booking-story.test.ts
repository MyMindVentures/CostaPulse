import { describe, expect, it } from "vitest";
import {
  bookingStoryMediaKey,
  mapPublicBookingStories,
  rawBookingStoriesSchema
} from "./booking-story";

describe("booking story public mapping", () => {
  it("keeps only signed booking-footage media and exposes no private fields", () => {
    const raw = rawBookingStoriesSchema.parse([
      {
        id: "00000000-0000-4000-8000-000000000001",
        title: "Sunset paddle",
        subtitle: null,
        description: null,
        guest_display_name: "M.",
        guest_country_code: "NL",
        guest_quote: "Wonderful",
        is_featured: true,
        sort_order: 0,
        published_at: "2026-07-25T12:00:00Z",
        experience_date: "2026-07-24T12:00:00Z",
        rating: 5,
        review_title: null,
        review_excerpt: "Great",
        cover_media: null,
        media_items: [
          {
            id: "00000000-0000-4000-8000-000000000002",
            bucket_id: "booking-footage",
            storage_path: "stories/story/photo.jpg",
            media_type: "image",
            mime_type: "image/jpeg",
            width: 1200,
            height: 800,
            duration_seconds: null,
            alt_text: null,
            caption: null,
            role: "cover",
            display_order: 0,
            is_primary: true,
            blurhash: null,
            dominant_color: "#102030"
          }
        ]
      }
    ]);
    const mapped = mapPublicBookingStories(
      raw,
      new Map([
        [
          bookingStoryMediaKey("booking-footage", "stories/story/photo.jpg"),
          "https://example.test/signed"
        ]
      ])
    );
    expect(mapped).toHaveLength(1);
    expect(mapped[0].coverMedia?.url).toBe("https://example.test/signed");
    expect(mapped[0]).not.toHaveProperty("bookingId");
    expect(mapped[0]).not.toHaveProperty("consentSource");
  });
});

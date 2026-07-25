import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BookingStory } from "@/lib/view-models/booking-story";
import { BookingStoryCard } from "./booking-story-card";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations:
    () => (key: string, values?: Record<string, string | number>) => {
      if (key === "photoCount") return `${values?.count} photos`;
      if (key === "videoCount") return `${values?.count} video`;
      if (key === "ratingLabel") return `Rated ${values?.rating} out of 5`;
      if (key === "viewStoryLabel") return `View story: ${values?.title}`;
      if (key === "viewStory") return "View Story";
      if (key === "featured") return "Featured";
      return key;
    }
}));

vi.mock("./booking-story-media", () => ({
  BookingStoryMedia: ({
    media
  }: {
    media: BookingStory["mediaItems"][number];
  }) => <div data-testid={`media-${media.id}`} />
}));

const cover: BookingStory["mediaItems"][number] = {
  id: "22222222-2222-4222-8222-222222222222",
  url: "https://example.test/story.jpg",
  mediaType: "image",
  mimeType: "image/jpeg",
  width: 1200,
  height: 800,
  durationSeconds: null,
  altText: "Guests on the coast",
  caption: null,
  role: "cover",
  displayOrder: 0,
  isPrimary: true,
  blurhash: null,
  dominantColor: "#123456"
};

const story: BookingStory = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Coastal morning",
  subtitle: null,
  description: null,
  guestDisplayName: "Emma & Tom",
  guestCountryCode: "NL",
  guestQuote: null,
  isFeatured: true,
  sortOrder: 0,
  publishedAt: "2026-07-25T12:00:00Z",
  experienceDate: "2026-06-24T12:00:00Z",
  rating: 5,
  reviewTitle: null,
  reviewExcerpt: null,
  coverMedia: cover,
  mediaItems: [cover],
  imageCount: 18,
  videoCount: 1
};

describe("BookingStoryCard", () => {
  it("renders the public story metadata and opens from either action", () => {
    const onOpen = vi.fn();
    render(<BookingStoryCard story={story} onOpen={onOpen} />);

    expect(screen.getByText("Emma & Tom")).toBeInTheDocument();
    expect(screen.getByText("NL")).toBeInTheDocument();
    expect(screen.getByText("18 photos")).toBeInTheDocument();
    expect(screen.getByText("1 video")).toBeInTheDocument();
    expect(screen.getByLabelText("Rated 5 out of 5")).toBeInTheDocument();
    expect(screen.getByText("June 2026")).toBeInTheDocument();

    const actions = screen.getAllByRole("button", {
      name: "View story: Coastal morning"
    });
    expect(actions).toHaveLength(2);
    fireEvent.click(actions[1]);
    expect(onOpen).toHaveBeenCalledOnce();
  });
});

import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { BookingStory } from "@/lib/view-models/booking-story";
import { BookingStoryViewer } from "./booking-story-viewer";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations:
    () => (key: string, values?: Record<string, string | number>) => {
      if (key === "viewerLabel") return `Story viewer: ${values?.title}`;
      if (key === "mediaCounter")
        return `${values?.current} of ${values?.total}`;
      if (key === "ratingLabel") return `Rated ${values?.rating} out of 5`;
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

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    }
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    }
  });
});

const story: BookingStory = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Coastal morning",
  subtitle: null,
  description: null,
  guestDisplayName: "M.",
  guestCountryCode: "NL",
  guestQuote: "A wonderful morning",
  isFeatured: true,
  sortOrder: 0,
  publishedAt: "2026-07-25T12:00:00Z",
  experienceDate: "2026-07-24T12:00:00Z",
  rating: 5,
  reviewTitle: "A perfect trip",
  reviewExcerpt: "Everything was beautifully organized.",
  coverMedia: null,
  mediaItems: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      url: "https://example.test/story.jpg",
      mediaType: "image",
      mimeType: "image/jpeg",
      width: 1200,
      height: 800,
      durationSeconds: null,
      altText: "Guests on the coast",
      caption: "Setting out from the beach",
      role: "cover",
      displayOrder: 0,
      isPrimary: true,
      blurhash: null,
      dominantColor: null
    }
  ],
  imageCount: 1,
  videoCount: 0
};

describe("BookingStoryViewer", () => {
  it("shows the public guest, date, rating and published review", () => {
    const { container } = render(
      <BookingStoryViewer story={story} open onClose={vi.fn()} />
    );

    expect(screen.getByRole("heading", { name: "M." })).toBeInTheDocument();
    expect(screen.getByText("NL")).toBeInTheDocument();
    expect(container.querySelector("time")).toHaveAttribute(
      "datetime",
      story.experienceDate
    );
    expect(screen.getByLabelText("Rated 5 out of 5")).toBeInTheDocument();
    expect(screen.getByText("A perfect trip")).toBeInTheDocument();
    expect(
      screen.getByText("Everything was beautifully organized.")
    ).toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";
import { aggregatePublishedRatings, resolveHeroMedia } from "./card-data";

describe("resolveHeroMedia", () => {
  it("prefers the hero image from experience_media over hero_image_path", () => {
    expect(
      resolveHeroMedia(
        [
          {
            storagePath: "boat-experience/gallery-1.png",
            mediaType: "image",
            altText: "Cove",
            isHero: false,
            displayOrder: 0
          },
          {
            storagePath: "boat-experience/hero.png",
            mediaType: "image",
            altText: "Private boat in a turquoise cove",
            isHero: true,
            displayOrder: 0
          }
        ],
        "boat-experience/legacy-hero.png"
      )
    ).toEqual({
      path: "boat-experience/hero.png",
      altText: "Private boat in a turquoise cove"
    });
  });

  it("ignores non-image hero media and falls back to hero_image_path", () => {
    expect(
      resolveHeroMedia(
        [
          {
            storagePath: "boat-experience/reel.mp4",
            mediaType: "video",
            altText: "Clip",
            isHero: true,
            displayOrder: 0
          }
        ],
        "boat-experience/hero.png"
      )
    ).toEqual({
      path: "boat-experience/hero.png",
      altText: null
    });
  });

  it("returns nulls when no media hero and no fallback path exist", () => {
    expect(resolveHeroMedia([], null)).toEqual({
      path: null,
      altText: null
    });
  });
});

describe("aggregatePublishedRatings", () => {
  it("averages published ratings to one decimal place", () => {
    expect(
      aggregatePublishedRatings([
        { rating: 5, status: "published" },
        { rating: 4, status: "published" },
        { rating: 5, status: "pending" }
      ])
    ).toEqual({
      averageRating: 4.5,
      reviewCount: 2
    });
  });

  it("returns null average when there are no published reviews", () => {
    expect(
      aggregatePublishedRatings([
        { rating: 5, status: "pending" },
        { rating: 4, status: "rejected" }
      ])
    ).toEqual({
      averageRating: null,
      reviewCount: 0
    });
  });
});

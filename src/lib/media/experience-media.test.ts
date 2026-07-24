import { afterEach, describe, expect, it } from "vitest";
import {
  EXPERIENCE_MEDIA_BUCKET,
  getExperienceHeroImageSrc,
  getExperienceMediaUrl
} from "./experience-media";

describe("getExperienceMediaUrl", () => {
  it("returns null when path or supabase url is missing", () => {
    expect(getExperienceMediaUrl(null, "https://example.supabase.co")).toBeNull();
    expect(getExperienceMediaUrl("curated/a.webp", undefined)).toBeNull();
  });

  it("builds a public storage url from an object path", () => {
    expect(
      getExperienceMediaUrl(
        "experiences/abc/hero.webp",
        "https://example.supabase.co/"
      )
    ).toBe(
      `https://example.supabase.co/storage/v1/object/public/${EXPERIENCE_MEDIA_BUCKET}/experiences/abc/hero.webp`
    );
  });

  it("strips leading slashes from stored paths", () => {
    expect(
      getExperienceMediaUrl(
        "/curated/private-charters.webp",
        "https://example.supabase.co"
      )
    ).toBe(
      `https://example.supabase.co/storage/v1/object/public/${EXPERIENCE_MEDIA_BUCKET}/curated/private-charters.webp`
    );
  });
});

describe("getExperienceHeroImageSrc", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  });

  it("prefers storage path over fallback", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    expect(
      getExperienceHeroImageSrc(
        "curated/private-charters.webp",
        "https://images.unsplash.com/photo-example"
      )
    ).toBe(
      `https://example.supabase.co/storage/v1/object/public/${EXPERIENCE_MEDIA_BUCKET}/curated/private-charters.webp`
    );
  });

  it("uses fallback when path is missing", () => {
    expect(
      getExperienceHeroImageSrc(null, "https://images.unsplash.com/photo-example")
    ).toBe("https://images.unsplash.com/photo-example");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BRAND_ASSETS_BUCKET,
  EXPERIENCE_MEDIA_BUCKET,
  getExperienceHeroImageSrc,
  getExperienceMediaUrl,
  getPublicStorageUrl,
  resolveExperienceMediaUrl,
  resolvePublicImageSrc,
  selectSiteLogoAsset
} from "./experience-media";

describe("getPublicStorageUrl", () => {
  it("returns null when bucket, path, or supabase url is missing", () => {
    expect(
      getPublicStorageUrl(null, "a.png", "https://example.supabase.co")
    ).toBeNull();
    expect(
      getPublicStorageUrl("brand-assets", null, "https://example.supabase.co")
    ).toBeNull();
    expect(
      getPublicStorageUrl("brand-assets", "logos/a.png", undefined)
    ).toBeNull();
  });

  it("builds a public url for any bucket", () => {
    expect(
      getPublicStorageUrl(
        "brand-assets",
        "logos/CostaPulse Logo.png",
        "https://example.supabase.co/"
      )
    ).toBe(
      "https://example.supabase.co/storage/v1/object/public/brand-assets/logos/CostaPulse%20Logo.png"
    );
  });
});

describe("getExperienceMediaUrl", () => {
  it("returns null when path or supabase url is missing", () => {
    expect(
      getExperienceMediaUrl(null, "https://example.supabase.co")
    ).toBeNull();
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

describe("resolveExperienceMediaUrl", () => {
  it("prefers linked media_assets bucket and path", () => {
    expect(
      resolveExperienceMediaUrl(
        "boat-experience/hero.jpg",
        {
          bucketId: EXPERIENCE_MEDIA_BUCKET,
          storagePath: "boat-experience/costapulse-boat-experience-hero.png"
        },
        "https://example.supabase.co"
      )
    ).toBe(
      `https://example.supabase.co/storage/v1/object/public/${EXPERIENCE_MEDIA_BUCKET}/boat-experience/costapulse-boat-experience-hero.png`
    );
  });

  it("falls back to experience-media path when no asset is linked", () => {
    expect(
      resolveExperienceMediaUrl(
        "boat-experience/hero.jpg",
        null,
        "https://example.supabase.co"
      )
    ).toBe(
      `https://example.supabase.co/storage/v1/object/public/${EXPERIENCE_MEDIA_BUCKET}/boat-experience/hero.jpg`
    );
  });
});

describe("selectSiteLogoAsset", () => {
  it("prefers the CostaPulse Logo.png under logos/", () => {
    expect(
      selectSiteLogoAsset([
        { bucketId: BRAND_ASSETS_BUCKET, storagePath: "logos/alt.png" },
        {
          bucketId: BRAND_ASSETS_BUCKET,
          storagePath: "logos/CostaPulse Logo.png"
        },
        { bucketId: BRAND_ASSETS_BUCKET, storagePath: "team/photo.png" }
      ])
    ).toEqual({
      bucketId: BRAND_ASSETS_BUCKET,
      storagePath: "logos/CostaPulse Logo.png"
    });
  });

  it("returns null when no logo assets exist", () => {
    expect(
      selectSiteLogoAsset([
        { bucketId: BRAND_ASSETS_BUCKET, storagePath: "team/photo.png" }
      ])
    ).toBeNull();
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
      getExperienceHeroImageSrc(
        null,
        "https://images.unsplash.com/photo-example"
      )
    ).toBe("https://images.unsplash.com/photo-example");
  });
});

describe("resolvePublicImageSrc", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns the storage url when the object exists", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 206
    }) as typeof fetch;

    await expect(
      resolvePublicImageSrc(
        "boat-experience/hero.png",
        null,
        "https://example.supabase.co"
      )
    ).resolves.toBe(
      `https://example.supabase.co/storage/v1/object/public/${EXPERIENCE_MEDIA_BUCKET}/boat-experience/hero.png`
    );
  });

  it("returns null when the storage object is missing and no fallback is provided", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404
    }) as typeof fetch;

    await expect(
      resolvePublicImageSrc(
        "missing/hero.png",
        null,
        "https://example.supabase.co"
      )
    ).resolves.toBeNull();
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getSiteLogoAsset } from "./media-assets";

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

afterEach(() => {
  if (originalSupabaseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
  }
});

describe("getSiteLogoAsset", () => {
  it("resolves the canonical logo from the verified public bucket", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co/";

    await expect(getSiteLogoAsset()).resolves.toEqual({
      url: "https://project.supabase.co/storage/v1/object/public/brand-assets/logos/CostaPulse%20Logo.png",
      alt: "CostaPulse",
      storagePath: "logos/CostaPulse Logo.png",
      bucketId: "brand-assets",
      isFallback: false
    });
  });

  it("uses the bundled brand mark when the public Supabase URL is unavailable", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    await expect(getSiteLogoAsset()).resolves.toEqual({
      url: "/brand/costapulse-mark.svg",
      alt: "CostaPulse",
      storagePath: "/brand/costapulse-mark.svg",
      bucketId: "public",
      isFallback: true
    });
  });
});

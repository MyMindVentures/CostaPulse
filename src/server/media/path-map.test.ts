import { describe, expect, it } from "vitest";
import {
  detectMimeFromMagic,
  isUsageAllowed,
  resolveMediaDestination,
  slugifySegment,
  usagesForEntity
} from "./path-map";

describe("path-map", () => {
  it("slugifies unsafe names", () => {
    expect(slugifySegment("Kevin De Vlieger!!")).toBe("kevin-de-vlieger");
  });

  it("restricts usages per entity", () => {
    expect(usagesForEntity("partner")).toContain("logo");
    expect(isUsageAllowed("partner", "avatar")).toBe(false);
    expect(isUsageAllowed("team_member", "avatar")).toBe(true);
  });

  it("builds experience gallery destinations", () => {
    const dest = resolveMediaDestination({
      entityType: "experience",
      usage: "gallery",
      entitySlug: "Kayak Mentor",
      originalFilename: "Photo.JPG",
      mimeType: "image/jpeg",
      uniqueSuffix: "abc123"
    });
    expect(dest.bucket).toBe("experience-media");
    expect(dest.folder).toBe("kayak-mentor/gallery");
    expect(dest.generatedFilename).toBe("kayak-mentor-gallery-abc123.jpg");
    expect(dest.storagePath).toBe(
      "kayak-mentor/gallery/kayak-mentor-gallery-abc123.jpg"
    );
  });

  it("builds variant paths under parent experience", () => {
    const dest = resolveMediaDestination({
      entityType: "experience_variant",
      usage: "hero",
      entitySlug: "sunset",
      parentSlug: "private-yacht-skipper",
      originalFilename: "hero.webp",
      mimeType: "image/webp",
      uniqueSuffix: "x1"
    });
    expect(dest.storagePath).toBe(
      "private-yacht-skipper/variants/sunset/hero/sunset-hero-x1.webp"
    );
  });

  it("detects jpeg magic bytes", () => {
    const bytes = new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0
    ]);
    expect(detectMimeFromMagic(bytes)).toBe("image/jpeg");
  });
});

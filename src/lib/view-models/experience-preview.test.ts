import { describe, expect, it } from "vitest";
import { experiencePreviewSchema } from "./experience-preview";

const validPreview = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "sunset-cruise",
  title: "Sunset Cruise",
  shortDescription: "Evening on the water",
  description: null,
  durationMinutes: 120,
  baseCapacity: 8,
  locationName: "Altea",
  locations: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      name: "Altea",
      slug: "altea",
      isPrimary: true
    }
  ],
  teamMembers: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      slug: "alex",
      displayName: "Alex",
      roleTitle: "Skipper",
      photoPath: null,
      isPrimary: true,
      roleLabel: null
    }
  ],
  availabilitySummary: "Mon, Wed, Fri",
  heroImagePath: null,
  heroImageUrl: null,
  heroImageAlt: null,
  heroFocalX: 50,
  heroFocalY: 50,
  categoryLabel: "Boat",
  providerName: "CostaPulse",
  experienceType: "boat_tour",
  highlights: ["Skipper included"],
  startingPriceMinor: 8900,
  currency: "EUR",
  pricingModel: "per_person" as const,
  averageRating: 4.8,
  reviewCount: 12
};

describe("experiencePreviewSchema", () => {
  it("parses locations, hosts, and availability summary", () => {
    expect(experiencePreviewSchema.parse(validPreview)).toMatchObject({
      slug: "sunset-cruise",
      availabilitySummary: "Mon, Wed, Fri",
      locations: [{ name: "Altea", isPrimary: true }],
      teamMembers: [{ displayName: "Alex" }]
    });
  });

  it("rejects empty slug", () => {
    expect(() =>
      experiencePreviewSchema.parse({ ...validPreview, slug: "" })
    ).toThrow();
  });
});

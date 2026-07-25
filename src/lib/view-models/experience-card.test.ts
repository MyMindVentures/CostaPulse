import { describe, expect, it } from "vitest";
import { experienceCardSchema } from "./experience-card";

const validCard = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "sunset-cruise",
  title: "Sunset Cruise",
  shortDescription: "Evening on the water",
  description: null,
  durationMinutes: 120,
  baseCapacity: 8,
  locationName: "Altea",
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

describe("experienceCardSchema", () => {
  it("parses a complete card view model", () => {
    expect(experienceCardSchema.parse(validCard)).toMatchObject({
      slug: "sunset-cruise",
      currency: "EUR"
    });
  });

  it("rejects missing required fields", () => {
    expect(() =>
      experienceCardSchema.parse({ ...validCard, slug: "" })
    ).toThrow();
  });
});

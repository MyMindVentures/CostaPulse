/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExperienceCard } from "./experience-card";
import type { ExperienceCardViewModel } from "@/lib/view-models/experience-card";

vi.mock("./experience-card-image", () => ({
  ExperienceCardImage: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  )
}));

vi.mock("@/features/experiences/favorite-toggle", () => ({
  FavoriteToggle: ({ label }: { label: string }) => (
    <button type="button" aria-label={label} aria-pressed="false" />
  )
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>
}));

vi.mock("next-intl/server", () => ({
  getLocale: async () => "en-GB",
  getTranslations: async () => {
    const messages: Record<string, string> = {
      favoriteLabel: "Save this experience",
      hostedBy: "Hosted by {name}",
      viewDetails: "View details",
      fromPrice: "From",
      priceUnitPerPerson: "per person",
      priceUnitPerGroup: "per experience",
      reviewCountLabel: "({count} reviews)",
      ratingAriaLabel: "Guest rating {rating} from {count} reviews",
      featuresLabel: "Experience highlights",
      "meta.durationHour": "{hours} hour",
      "meta.durationHours": "{hours} hours",
      "meta.durationHoursMinutes": "{hours}h {minutes}m",
      "meta.durationValue": "{minutes} minutes",
      "meta.capacityValue": "Up to {count} guests"
    };

    return (key: string, values?: Record<string, string | number>) => {
      let template = messages[key] ?? key;
      if (values) {
        for (const [name, value] of Object.entries(values)) {
          template = template.replace(`{${name}}`, String(value));
        }
      }
      return template;
    };
  }
}));

const baseExperience: ExperienceCardViewModel = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "boat-experience",
  title: "Boat Experience",
  shortDescription: "Skippered boat time on the Costa Blanca.",
  description: null,
  durationMinutes: 240,
  baseCapacity: 8,
  locationName: "Altea",
  heroImagePath: "boat-experience/hero.png",
  heroImageAlt: "Private boat in a turquoise cove",
  categoryLabel: "Yacht Experience",
  providerName: "CostaPulse Host",
  experienceType: "boat_experience",
  highlights: ["Professional local skipper", "Fuel options"],
  startingPriceMinor: 49500,
  currency: "EUR",
  pricingModel: "per_group",
  averageRating: null,
  reviewCount: 0
};

afterEach(() => {
  cleanup();
  process.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
});

describe("ExperienceCard", () => {
  it("renders catalog data without fabricated copy", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";

    render(await ExperienceCard({ experience: baseExperience }));

    const image = screen.getByRole("img", {
      name: "Private boat in a turquoise cove"
    });
    expect(image.getAttribute("src")).toBe(
      "https://example.supabase.co/storage/v1/object/public/experience-media/boat-experience/hero.png"
    );
    expect(screen.getByText("Yacht Experience")).toBeTruthy();
    expect(
      screen.getByText("Skippered boat time on the Costa Blanca.")
    ).toBeTruthy();
    expect(screen.getByText("4 hours")).toBeTruthy();
    expect(screen.getByText("Up to 8 guests")).toBeTruthy();
    expect(screen.getByText("Professional local skipper")).toBeTruthy();
    expect(screen.getByText("Fuel options")).toBeTruthy();
    expect(screen.getByText("Hosted by CostaPulse Host")).toBeTruthy();
    expect(screen.getByText("From")).toBeTruthy();
    expect(screen.getByText("€495")).toBeTruthy();
    expect(screen.getByText("per experience")).toBeTruthy();
    expect(screen.queryByText("Personally hosted")).toBeNull();
    expect(screen.queryByText("Guest favourite")).toBeNull();
    expect(screen.queryByText("On request")).toBeNull();
    expect(screen.queryByText("Local expert and trusted host")).toBeNull();
  });

  it("omits optional fields when catalog values are missing", async () => {
    render(
      await ExperienceCard({
        experience: {
          ...baseExperience,
          shortDescription: null,
          categoryLabel: null,
          providerName: null,
          locationName: null,
          highlights: [],
          heroImagePath: null,
          heroImageAlt: null,
          startingPriceMinor: null,
          currency: null,
          pricingModel: null
        }
      })
    );

    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByText("Yacht Experience")).toBeNull();
    expect(
      screen.queryByText("Skippered boat time on the Costa Blanca.")
    ).toBeNull();
    expect(screen.queryByText("Hosted by CostaPulse Host")).toBeNull();
    expect(screen.queryByText("From")).toBeNull();
    expect(screen.getByText("4 hours")).toBeTruthy();
    expect(screen.getByText("Up to 8 guests")).toBeTruthy();
  });

  it("shows published ratings only when reviewCount is positive", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";

    render(
      await ExperienceCard({
        experience: {
          ...baseExperience,
          averageRating: 4.5,
          reviewCount: 2
        }
      })
    );

    expect(screen.getByText("4.5")).toBeTruthy();
    expect(screen.getByText("(2 reviews)")).toBeTruthy();
  });

  it("renders long translated titles without truncating the accessible name", async () => {
    const longTitle =
      "Private sunset yacht charter with skipper, soft drinks and coastal storytelling along the Costa Blanca";

    render(
      await ExperienceCard({
        experience: {
          ...baseExperience,
          title: longTitle,
          startingPriceMinor: null,
          currency: null,
          pricingModel: null,
          averageRating: null,
          reviewCount: 0
        }
      })
    );

    expect(screen.getByRole("heading", { name: longTitle })).toBeTruthy();
    expect(screen.queryByText("€495")).toBeNull();
    expect(screen.queryByText("4.5")).toBeNull();
  });
});

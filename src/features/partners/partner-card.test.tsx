import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PartnerDirectoryItem } from "@/lib/view-models/partner-directory";
import { PartnerCard } from "./partner-card";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string, values?: Record<string, string>) => {
    if (key === "selectPartner") return `Show ${values?.name} on the map`;
    const labels: Record<string, string> = {
      trustedPartner: "CostaPulse partner",
      featured: "Featured",
      scans: "QR scans",
      bookings: "Bookings",
      conversion: "Conversion"
    };
    return labels[key] ?? key;
  }
}));

const item: PartnerDirectoryItem = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "la-plata",
  name: "La Plata Casa Matilde",
  category: "beach_restaurant",
  description: "Mediterranean restaurant",
  websiteUrl: "https://example.test",
  phone: "+34 952 00 00 00",
  isFeatured: true,
  publishedAt: "2026-07-25T00:00:00Z",
  image: { url: null, alt: "La Plata" },
  logo: { url: null, alt: "La Plata logo" },
  location: {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "benajarafe",
    name: "Benajarafe",
    addressLine1: "Paseo Marítimo 1",
    postalCode: "29790",
    city: "Benajarafe",
    province: "Málaga",
    countryCode: "ES",
    latitude: 36.7,
    longitude: -4.18,
    zoom: 13,
    directionsUrl: "https://maps.example/partner"
  },
  metrics: { scans: 0, bookings: 0, conversionRate: 0 },
  mostBookedExperience: null
};

describe("PartnerCard", () => {
  it("renders truthful public data and selects the matching partner", () => {
    const onSelect = vi.fn();
    render(<PartnerCard item={item} selected onSelect={onSelect} />);

    const button = screen.getByRole("button", {
      name: "Show La Plata Casa Matilde on the map"
    });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Beach restaurant")).toBeInTheDocument();
    expect(screen.getByText("Benajarafe")).toBeInTheDocument();
    expect(screen.getAllByText("0")).toHaveLength(2);
    expect(screen.getByText("0%")).toBeInTheDocument();

    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith("la-plata");
  });
});

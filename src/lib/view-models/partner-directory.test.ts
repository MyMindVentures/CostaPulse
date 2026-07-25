import { describe, expect, it } from "vitest";
import {
  formatPartnerCategory,
  parsePartnerDirectoryRows
} from "./partner-directory";

const row = {
  partner_id: "11111111-1111-4111-8111-111111111111",
  slug: "la-plata",
  name: "La Plata",
  category: "beach_restaurant",
  short_description: null,
  website_url: null,
  phone: "+34 952 00 00 00",
  is_featured: true,
  published_at: "2026-07-25T00:00:00Z",
  location_id: "22222222-2222-4222-8222-222222222222",
  location_slug: "benajarafe",
  location_name: "Benajarafe",
  address_line_1: "Paseo Marítimo 1",
  postal_code: "29790",
  city: "Benajarafe",
  country_code: "ES",
  province: "Málaga",
  latitude: 36.7,
  longitude: -4.18,
  map_zoom: 13,
  directions_url: "https://maps.example/partner",
  image_bucket_id: "brand-assets",
  image_storage_path: "partners/la-plata/card.webp",
  image_alt_text: null,
  logo_bucket_id: null,
  logo_storage_path: null,
  logo_alt_text: null,
  qr_scan_count: 8,
  attributed_booking_count: 2,
  conversion_rate: 25,
  most_booked_experience_slug: "sunset-paddle",
  most_booked_experience_name: "Sunset Paddle",
  total_partner_count: 1,
  total_qr_scan_count: 8,
  total_booking_count: 2
};

describe("partner directory view model", () => {
  it("maps the secured RPC row and aggregate totals", () => {
    const result = parsePartnerDirectoryRows(
      [row],
      "https://project.supabase.co"
    );
    expect(result.totals).toEqual({ partners: 1, scans: 8, bookings: 2 });
    expect(result.items[0]).toMatchObject({
      slug: "la-plata",
      phone: "+34 952 00 00 00",
      location: {
        addressLine1: "Paseo Marítimo 1",
        postalCode: "29790",
        countryCode: "ES"
      },
      metrics: { scans: 8, bookings: 2, conversionRate: 25 },
      mostBookedExperience: {
        slug: "sunset-paddle",
        name: "Sunset Paddle"
      }
    });
    expect(result.items[0]?.image.url).toContain(
      "/storage/v1/object/public/brand-assets/partners/la-plata/card.webp"
    );
  });

  it("returns a truthful empty result for invalid input", () => {
    expect(parsePartnerDirectoryRows(null).items).toEqual([]);
  });

  it("turns stored category keys into readable labels", () => {
    expect(formatPartnerCategory("beach_restaurant")).toBe("Beach restaurant");
  });
});

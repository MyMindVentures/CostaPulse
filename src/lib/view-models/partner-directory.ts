import { z } from "zod";
import { getPublicStorageUrl } from "@/lib/media/experience-media";

export const partnerDirectoryRpcRowSchema = z.object({
  partner_id: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.string().nullable(),
  short_description: z.string().nullable(),
  website_url: z.string().url().nullable(),
  phone: z.string().nullable(),
  is_featured: z.boolean(),
  published_at: z.string(),
  location_id: z.string().uuid(),
  location_slug: z.string().min(1),
  location_name: z.string().min(1),
  address_line_1: z.string().nullable(),
  postal_code: z.string().nullable(),
  city: z.string().min(1),
  province: z.string().nullable(),
  country_code: z.string().length(2),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  map_zoom: z.coerce.number().int(),
  directions_url: z.string().url().nullable(),
  image_bucket_id: z.string().nullable(),
  image_storage_path: z.string().nullable(),
  image_alt_text: z.string().nullable(),
  logo_bucket_id: z.string().nullable(),
  logo_storage_path: z.string().nullable(),
  logo_alt_text: z.string().nullable(),
  qr_scan_count: z.coerce.number().int().nonnegative(),
  attributed_booking_count: z.coerce.number().int().nonnegative(),
  conversion_rate: z.coerce.number().nonnegative(),
  most_booked_experience_slug: z.string().nullable(),
  most_booked_experience_name: z.string().nullable(),
  total_partner_count: z.coerce.number().int().nonnegative(),
  total_qr_scan_count: z.coerce.number().int().nonnegative(),
  total_booking_count: z.coerce.number().int().nonnegative()
});

export type PartnerDirectoryItem = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  websiteUrl: string | null;
  phone: string | null;
  isFeatured: boolean;
  publishedAt: string;
  image: { url: string | null; alt: string };
  logo: { url: string | null; alt: string };
  location: {
    id: string;
    slug: string;
    name: string;
    addressLine1: string | null;
    postalCode: string | null;
    city: string;
    province: string | null;
    countryCode: string;
    latitude: number;
    longitude: number;
    zoom: number;
    directionsUrl: string | null;
  };
  metrics: { scans: number; bookings: number; conversionRate: number };
  mostBookedExperience: { slug: string; name: string } | null;
};

export type PartnerDirectoryData = {
  items: PartnerDirectoryItem[];
  totals: { partners: number; scans: number; bookings: number };
  categories: string[];
  areas: string[];
};

export function formatPartnerCategory(value: string): string {
  const words = value.replaceAll("_", " ").trim();
  return words ? words.charAt(0).toLocaleUpperCase() + words.slice(1) : value;
}

export function parsePartnerDirectoryRows(
  rows: unknown,
  supabaseUrl?: string
): PartnerDirectoryData {
  if (!Array.isArray(rows)) {
    return {
      items: [],
      totals: { partners: 0, scans: 0, bookings: 0 },
      categories: [],
      areas: []
    };
  }

  const parsed = rows.flatMap((row) => {
    const result = partnerDirectoryRpcRowSchema.safeParse(row);
    return result.success ? [result.data] : [];
  });

  const items = parsed.map<PartnerDirectoryItem>((row) => ({
    id: row.partner_id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.short_description,
    websiteUrl: row.website_url,
    phone: row.phone,
    isFeatured: row.is_featured,
    publishedAt: row.published_at,
    image: {
      url: getPublicStorageUrl(
        row.image_bucket_id,
        row.image_storage_path,
        supabaseUrl
      ),
      alt: row.image_alt_text ?? row.name
    },
    logo: {
      url: getPublicStorageUrl(
        row.logo_bucket_id,
        row.logo_storage_path,
        supabaseUrl
      ),
      alt: row.logo_alt_text ?? row.name
    },
    location: {
      id: row.location_id,
      slug: row.location_slug,
      name: row.location_name,
      addressLine1: row.address_line_1,
      postalCode: row.postal_code,
      city: row.city,
      province: row.province,
      countryCode: row.country_code,
      latitude: row.latitude,
      longitude: row.longitude,
      zoom: row.map_zoom,
      directionsUrl: row.directions_url
    },
    metrics: {
      scans: row.qr_scan_count,
      bookings: row.attributed_booking_count,
      conversionRate: row.conversion_rate
    },
    mostBookedExperience:
      row.most_booked_experience_slug && row.most_booked_experience_name
        ? {
            slug: row.most_booked_experience_slug,
            name: row.most_booked_experience_name
          }
        : null
  }));

  return {
    items,
    totals: parsed[0]
      ? {
          partners: parsed[0].total_partner_count,
          scans: parsed[0].total_qr_scan_count,
          bookings: parsed[0].total_booking_count
        }
      : { partners: 0, scans: 0, bookings: 0 },
    categories: [
      ...new Set(items.flatMap((item) => item.category ?? []))
    ].sort(),
    areas: [...new Set(items.map((item) => item.location.city))].sort()
  };
}

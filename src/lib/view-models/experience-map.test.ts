import { afterEach, describe, expect, it } from "vitest";
import {
  buildExperienceMapMarkerKey,
  filterMapItemsByLocationSlug,
  hasValidMapCoordinates,
  mapExperienceMapRow,
  parseExperienceMapRows,
  resolveSelectedMarkerKey,
  type ExperienceMapRpcRow
} from "./experience-map";

const supabaseUrl = "https://example.supabase.co";

function baseRow(
  overrides: Partial<ExperienceMapRpcRow> = {}
): ExperienceMapRpcRow {
  return {
    experience_id: "11111111-1111-4111-8111-111111111111",
    slug: "sunset-cruise",
    title: "Sunset Cruise",
    short_description: "An evening on the water.",
    experience_type: "boat_experience",
    category_label: "Yacht",
    hero_image_path: "sunset/hero.jpg",
    duration_minutes: 180,
    base_capacity: 8,
    base_currency: "eur",
    is_featured: true,
    location_id: "22222222-2222-4222-8222-222222222222",
    location_slug: "altea",
    location_name: "Altea",
    city: "Altea",
    province: "Alicante",
    latitude: 38.6,
    longitude: -0.05,
    map_zoom: 12,
    meeting_point: "Marina dock A",
    team_members: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        slug: "alex",
        displayName: "Alex",
        roleTitle: "Skipper",
        photoPath: "team/alex.jpg",
        isPrimary: true,
        roleLabel: "Host"
      }
    ],
    next_available_at: "2026-08-01T17:00:00+02:00",
    available_slot_count: 4,
    from_price_minor: 49500,
    ...overrides
  };
}

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
});

describe("hasValidMapCoordinates", () => {
  it("rejects non-finite and out-of-range values", () => {
    expect(hasValidMapCoordinates(Number.NaN, 0)).toBe(false);
    expect(hasValidMapCoordinates(91, 0)).toBe(false);
    expect(hasValidMapCoordinates(38.6, -0.05)).toBe(true);
  });
});

describe("mapExperienceMapRow", () => {
  it("maps a complete RPC row into a view model with markerKey", () => {
    const item = mapExperienceMapRow(baseRow(), supabaseUrl);

    expect(item).not.toBeNull();
    expect(item!.id).toBe("11111111-1111-4111-8111-111111111111");
    expect(item!.markerKey).toBe(
      buildExperienceMapMarkerKey(
        "11111111-1111-4111-8111-111111111111",
        "22222222-2222-4222-8222-222222222222"
      )
    );
    expect(item!.slug).toBe("sunset-cruise");
    expect(item!.description).toBe("An evening on the water.");
    expect(item!.category).toBe("Yacht");
    expect(item!.price).toEqual({ amountMinor: 49500, currency: "EUR" });
    expect(item!.location.latitude).toBe(38.6);
    expect(item!.availability.slotCount).toBe(4);
    expect(item!.teamMembers).toHaveLength(1);
    expect(item!.teamMembers[0]?.displayName).toBe("Alex");
    expect(item!.imageUrl).toContain("/experience-media/sunset/hero.jpg");
  });

  it("handles missing price, image, availability, and empty team", () => {
    const item = mapExperienceMapRow(
      baseRow({
        from_price_minor: null,
        hero_image_path: null,
        next_available_at: null,
        available_slot_count: 0,
        team_members: [],
        base_currency: null,
        short_description: null,
        category_label: null
      }),
      supabaseUrl
    );

    expect(item!.price.amountMinor).toBeNull();
    expect(item!.price.currency).toBe("EUR");
    expect(item!.imageUrl).toBeNull();
    expect(item!.availability).toEqual({
      nextAvailableAt: null,
      slotCount: 0
    });
    expect(item!.teamMembers).toEqual([]);
    expect(item!.description).toBeNull();
    expect(item!.category).toBeNull();
  });

  it("returns null for invalid coordinates", () => {
    expect(
      mapExperienceMapRow(baseRow({ latitude: Number.NaN }), supabaseUrl)
    ).toBeNull();
  });
});

describe("parseExperienceMapRows", () => {
  it("coerces numeric strings for coordinates and slot counts", () => {
    const items = parseExperienceMapRows(
      [
        {
          ...baseRow(),
          latitude: "38.5",
          longitude: "-0.1",
          map_zoom: "11",
          available_slot_count: "2"
        }
      ],
      supabaseUrl
    );

    expect(items).toHaveLength(1);
    expect(items[0]?.location.latitude).toBe(38.5);
    expect(items[0]?.location.longitude).toBe(-0.1);
    expect(items[0]?.location.zoom).toBe(11);
    expect(items[0]?.availability.slotCount).toBe(2);
  });

  it("skips invalid rows and returns valid ones", () => {
    const items = parseExperienceMapRows(
      [baseRow(), { slug: "broken" }, null],
      supabaseUrl
    );
    expect(items).toHaveLength(1);
    expect(items[0]?.slug).toBe("sunset-cruise");
  });

  it("returns empty for non-arrays", () => {
    expect(parseExperienceMapRows(null)).toEqual([]);
    expect(parseExperienceMapRows({})).toEqual([]);
  });
});

describe("resolveSelectedMarkerKey", () => {
  it("resolves by experience slug and optional location slug", () => {
    const items = parseExperienceMapRows(
      [
        baseRow(),
        baseRow({
          location_id: "44444444-4444-4444-8444-444444444444",
          location_slug: "calpe",
          location_name: "Calpe",
          latitude: 38.64,
          longitude: 0.04
        })
      ],
      supabaseUrl
    );

    expect(resolveSelectedMarkerKey(items, "sunset-cruise", null)).toBe(
      items[0]?.markerKey
    );
    expect(resolveSelectedMarkerKey(items, "sunset-cruise", "calpe")).toBe(
      items[1]?.markerKey
    );
    expect(resolveSelectedMarkerKey(items, "missing", null)).toBeNull();
  });
});

describe("filterMapItemsByLocationSlug", () => {
  it("filters by location slug when set", () => {
    const items = parseExperienceMapRows(
      [
        baseRow(),
        baseRow({
          location_id: "44444444-4444-4444-8444-444444444444",
          location_slug: "calpe",
          location_name: "Calpe",
          latitude: 38.64,
          longitude: 0.04
        })
      ],
      supabaseUrl
    );

    expect(filterMapItemsByLocationSlug(items, null)).toHaveLength(2);
    expect(filterMapItemsByLocationSlug(items, "calpe")).toHaveLength(1);
    expect(filterMapItemsByLocationSlug(items, "calpe")[0]?.location.slug).toBe(
      "calpe"
    );
  });
});

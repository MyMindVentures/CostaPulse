import { describe, expect, it } from "vitest";
import {
  applyCatalogFilters,
  catalogFiltersEqual,
  catalogFiltersToSearchParams,
  parseCatalogFilters
} from "./catalog-filters";

describe("parseCatalogFilters", () => {
  it("parses known filter keys", () => {
    const params = new URLSearchParams({
      date: "2026-08-01",
      experienceType: "boat_experience",
      location: "altea",
      teamMember: "alex",
      experience: "sunset-cruise",
      view: "map"
    });

    expect(parseCatalogFilters(params)).toEqual({
      date: "2026-08-01",
      experienceType: "boat_experience",
      location: "altea",
      teamMember: "alex",
      experience: "sunset-cruise",
      view: "map"
    });
  });

  it("ignores invalid date and view values", () => {
    expect(
      parseCatalogFilters(
        new URLSearchParams({ date: "01-08-2026", view: "grid" })
      )
    ).toEqual({
      date: null,
      experienceType: null,
      location: null,
      teamMember: null,
      experience: null,
      view: null
    });
  });

  it("accepts Next.js searchParams records", () => {
    expect(
      parseCatalogFilters({
        view: "list",
        referral: "partner-1"
      })
    ).toMatchObject({
      view: "list",
      experience: null
    });
  });
});

describe("applyCatalogFilters", () => {
  it("preserves unrelated query params while updating filters", () => {
    const current = new URLSearchParams({
      referral: "partner-1",
      locale: "en",
      booking: "draft-123",
      view: "list",
      date: "2026-08-01"
    });

    const next = applyCatalogFilters(current, {
      view: "map",
      date: null,
      experienceType: "bbq_experience"
    });

    expect(next.get("referral")).toBe("partner-1");
    expect(next.get("locale")).toBe("en");
    expect(next.get("booking")).toBe("draft-123");
    expect(next.get("view")).toBe("map");
    expect(next.get("date")).toBeNull();
    expect(next.get("experienceType")).toBe("bbq_experience");
  });

  it("round-trips through serialize and parse", () => {
    const filters = {
      date: "2026-09-12",
      experienceType: "paddlesurf_mentor",
      location: "calpe",
      teamMember: "33333333-3333-4333-8333-333333333333",
      experience: "paddle-day",
      view: "list" as const
    };

    const params = catalogFiltersToSearchParams(
      filters,
      new URLSearchParams({ ref: "x" })
    );
    expect(params.get("ref")).toBe("x");
    expect(parseCatalogFilters(params)).toEqual(filters);
  });
});

describe("catalogFiltersEqual", () => {
  it("compares filter objects by value", () => {
    const a = parseCatalogFilters(new URLSearchParams({ view: "map" }));
    const b = parseCatalogFilters(new URLSearchParams({ view: "map" }));
    const c = parseCatalogFilters(new URLSearchParams({ view: "list" }));
    expect(catalogFiltersEqual(a, b)).toBe(true);
    expect(catalogFiltersEqual(a, c)).toBe(false);
  });
});

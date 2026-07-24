import { describe, expect, it } from "vitest";
import {
  catalogDateToRpcRange,
  catalogFiltersToMapRpcParams,
  isUuid
} from "./map-rpc-params";

describe("isUuid", () => {
  it("accepts valid UUID v4-style strings", () => {
    expect(isUuid("33333333-3333-4333-8333-333333333333")).toBe(true);
  });

  it("rejects slugs and empty values", () => {
    expect(isUuid("alex")).toBe(false);
    expect(isUuid("")).toBe(false);
    expect(isUuid(null)).toBe(false);
  });
});

describe("catalogDateToRpcRange", () => {
  it("maps a calendar date to a UTC day window", () => {
    expect(catalogDateToRpcRange("2026-08-01")).toEqual({
      from: "2026-08-01T00:00:00.000Z",
      to: "2026-08-02T00:00:00.000Z"
    });
  });

  it("returns null for invalid dates", () => {
    expect(catalogDateToRpcRange(null)).toBeNull();
    expect(catalogDateToRpcRange("01-08-2026")).toBeNull();
  });
});

describe("catalogFiltersToMapRpcParams", () => {
  it("omits date bounds when no date is set", () => {
    expect(
      catalogFiltersToMapRpcParams({
        date: null,
        experienceType: "boat_experience",
        teamMember: "33333333-3333-4333-8333-333333333333"
      })
    ).toEqual({
      experienceType: "boat_experience",
      teamMemberId: "33333333-3333-4333-8333-333333333333"
    });
  });

  it("ignores non-UUID team members", () => {
    expect(
      catalogFiltersToMapRpcParams({
        date: "2026-08-01",
        experienceType: null,
        teamMember: "kevin"
      })
    ).toEqual({
      from: "2026-08-01T00:00:00.000Z",
      to: "2026-08-02T00:00:00.000Z"
    });
  });
});

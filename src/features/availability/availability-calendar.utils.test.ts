import { describe, expect, it } from "vitest";
import {
  availabilityBasePath,
  dateKeyInTimeZone
} from "./availability-calendar.utils";

const DISPLAY_TIME_ZONE = "Europe/Madrid";

describe("dateKeyInTimeZone", () => {
  it.each([
    ["30 July", "2026-07-29T22:30:00.000Z", "2026-07-30"],
    ["UTC midnight", "2026-07-30T00:15:00.000Z", "2026-07-30"],
    ["month boundary", "2026-07-31T22:30:00.000Z", "2026-08-01"],
    ["year boundary", "2026-12-31T23:30:00.000Z", "2027-01-01"],
    ["spring DST", "2026-03-29T00:30:00.000Z", "2026-03-29"],
    ["autumn DST", "2026-10-25T01:30:00.000Z", "2026-10-25"]
  ])("resolves %s in the configured timezone", (_name, instant, expected) => {
    expect(dateKeyInTimeZone(new Date(instant), DISPLAY_TIME_ZONE)).toBe(
      expected
    );
  });
});

describe("availabilityBasePath", () => {
  it("returns the calendar route for a public date-detail route", () => {
    expect(availabilityBasePath("/availability/2026-07-25")).toBe(
      "/availability"
    );
  });

  it("preserves calendar routes that do not use the public date segment", () => {
    expect(availabilityBasePath("/availability")).toBe("/availability");
    expect(availabilityBasePath("/team/kevin/availability")).toBe(
      "/team/kevin/availability"
    );
  });
});

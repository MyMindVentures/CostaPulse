import { describe, expect, it } from "vitest";
import { isDateKey, isMonthKey } from "./availability-calendar";

describe("availability route keys", () => {
  it("validates real calendar dates", () => {
    expect(isDateKey("2028-02-29")).toBe(true);
    expect(isDateKey("2027-02-29")).toBe(false);
    expect(isDateKey("2026-13-01")).toBe(false);
    expect(isDateKey("10-08-2026")).toBe(false);
  });

  it("validates bounded month keys", () => {
    expect(isMonthKey("2026-08")).toBe(true);
    expect(isMonthKey("2026-00")).toBe(false);
    expect(isMonthKey("2200-08")).toBe(false);
  });
});

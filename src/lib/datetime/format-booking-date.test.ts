import { describe, expect, it } from "vitest";
import {
  formatBookingDateLong,
  formatBookingDateShort,
  formatMonthYearUtc
} from "./format-booking-date";

describe("formatBookingDateLong", () => {
  it("formats a UTC calendar day deterministically", () => {
    expect(formatBookingDateLong("2026-07-26")).toBe("Sun, 26 July 2026");
  });

  it("returns null for invalid input", () => {
    expect(formatBookingDateLong(null)).toBeNull();
    expect(formatBookingDateLong("26-07-2026")).toBeNull();
  });
});

describe("formatBookingDateShort", () => {
  it("keeps a stable comma-separated shape in Europe/Madrid", () => {
    expect(formatBookingDateShort("2026-07-26", "Europe/Madrid")).toBe(
      "Sun, 26 Jul 2026"
    );
  });
});

describe("formatMonthYearUtc", () => {
  it("formats month labels without Intl variance", () => {
    expect(formatMonthYearUtc(2026, 6)).toBe("July 2026");
  });
});

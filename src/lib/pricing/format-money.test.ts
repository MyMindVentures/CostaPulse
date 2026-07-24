import { describe, expect, it } from "vitest";
import { formatDurationHours, formatMinorUnitAmount } from "./format-money";

describe("formatMinorUnitAmount", () => {
  it("formats whole-euro amounts without cents", () => {
    expect(formatMinorUnitAmount(49500, "EUR")).toBe("€495");
  });

  it("keeps cents when present", () => {
    expect(formatMinorUnitAmount(6550, "EUR")).toBe("€65.50");
  });
});

describe("formatDurationHours", () => {
  it("converts minutes to hours for card meta", () => {
    expect(formatDurationHours(240)).toEqual({ hours: 4, labelKey: "hours" });
    expect(formatDurationHours(150)).toEqual({ hours: 2.5, labelKey: "hours" });
    expect(formatDurationHours(60)).toEqual({ hours: 1, labelKey: "hour" });
  });
});

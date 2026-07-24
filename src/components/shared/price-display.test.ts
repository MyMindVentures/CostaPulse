import { describe, expect, it } from "vitest";
import { formatDurationLabel } from "./duration-display";
import { formatPriceLabel } from "./price-display";

describe("formatPriceLabel", () => {
  it("formats minor units with the provided locale", () => {
    expect(formatPriceLabel(49500, "EUR", "en-GB")).toBe("€495");
  });

  it("returns null when price or currency is missing", () => {
    expect(formatPriceLabel(null, "EUR")).toBeNull();
    expect(formatPriceLabel(49500, null)).toBeNull();
  });
});

describe("formatDurationLabel", () => {
  const messages = {
    hour: ({ hours }: { hours: number }) => `${hours} hour`,
    hours: ({ hours }: { hours: number }) => `${hours} hours`,
    hoursMinutes: ({ hours, minutes }: { hours: number; minutes: number }) =>
      `${hours}h ${minutes}m`,
    minutes: ({ minutes }: { minutes: number }) => `${minutes} minutes`
  };

  it("formats whole hours and mixed durations", () => {
    expect(formatDurationLabel(60, messages)).toBe("1 hour");
    expect(formatDurationLabel(240, messages)).toBe("4 hours");
    expect(formatDurationLabel(90, messages)).toBe("1h 30m");
    expect(formatDurationLabel(45, messages)).toBe("45 minutes");
  });
});

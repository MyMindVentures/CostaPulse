import { describe, expect, it } from "vitest";
import { summarizeAvailabilityFromSlots } from "./summarize";

const TZ = "Europe/Madrid";

describe("summarizeAvailabilityFromSlots", () => {
  it("returns null when there are no slots", () => {
    expect(summarizeAvailabilityFromSlots([], TZ)).toBeNull();
  });

  it("returns Daily when all seven weekdays appear", () => {
    const starts = [
      "2026-07-20T08:00:00.000Z", // Mon
      "2026-07-21T08:00:00.000Z",
      "2026-07-22T08:00:00.000Z",
      "2026-07-23T08:00:00.000Z",
      "2026-07-24T08:00:00.000Z",
      "2026-07-25T08:00:00.000Z",
      "2026-07-26T08:00:00.000Z" // Sun
    ];

    expect(summarizeAvailabilityFromSlots(starts, TZ)).toBe("Daily");
  });

  it("lists only weekdays that have slots", () => {
    const starts = [
      "2026-07-20T08:00:00.000Z", // Mon
      "2026-07-22T08:00:00.000Z", // Wed
      "2026-07-24T08:00:00.000Z" // Fri
    ];

    expect(summarizeAvailabilityFromSlots(starts, TZ)).toBe("Mon, Wed, Fri");
  });
});

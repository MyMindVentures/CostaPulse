import { describe, expect, it } from "vitest";
import {
  filterSlotsForLocalDate,
  formatLocalStartLabel,
  getLocalDateKey,
  isSlotEligibleForParty
} from "./filter";
import { classifyDayAvailability } from "./thresholds";

const TZ = "Europe/Madrid";

describe("availability filter helpers", () => {
  it("maps UTC instants to the local calendar date", () => {
    expect(getLocalDateKey("2026-07-26T08:00:00.000Z", TZ)).toBe("2026-07-26");
  });

  it("formats local start labels in the experience timezone", () => {
    expect(formatLocalStartLabel("2026-07-26T08:00:00.000Z", TZ)).toBe("10:00");
  });

  it("rejects slots past booking cutoff", () => {
    const result = isSlotEligibleForParty({
      startsAt: "2026-07-26T08:00:00.000Z",
      endsAt: "2026-07-26T11:00:00.000Z",
      timezone: TZ,
      status: "scheduled",
      capacityTotal: 11,
      capacityAvailable: 11,
      bookingCutoffAt: "2026-07-26T06:00:00.000Z",
      isInstantConfirmation: true,
      isBookable: true,
      partySize: 2,
      nowMs: Date.parse("2026-07-26T06:00:00.000Z")
    });

    expect(result.ok).toBe(false);
  });

  it("rejects slots without enough remaining capacity", () => {
    const result = isSlotEligibleForParty({
      startsAt: "2026-07-26T08:00:00.000Z",
      endsAt: "2026-07-26T11:00:00.000Z",
      timezone: TZ,
      status: "scheduled",
      capacityTotal: 11,
      capacityAvailable: 1,
      bookingCutoffAt: "2026-07-26T06:00:00.000Z",
      isInstantConfirmation: true,
      isBookable: true,
      partySize: 2,
      nowMs: Date.parse("2026-07-20T10:00:00.000Z")
    });

    expect(result.ok).toBe(false);
  });

  it("keeps eligible slots for the requested local date only", () => {
    const slots = filterSlotsForLocalDate(
      [
        {
          id: "11111111-1111-4111-8111-111111111111",
          startsAt: "2026-07-26T08:00:00.000Z",
          endsAt: "2026-07-26T11:00:00.000Z",
          timezone: TZ,
          status: "scheduled",
          capacityTotal: 11,
          capacityAvailable: 11,
          bookingCutoffAt: "2026-07-26T06:00:00.000Z",
          isInstantConfirmation: true,
          isBookable: true,
          locationId: null
        },
        {
          id: "22222222-2222-4222-8222-222222222222",
          startsAt: "2026-07-27T08:00:00.000Z",
          endsAt: "2026-07-27T11:00:00.000Z",
          timezone: TZ,
          status: "scheduled",
          capacityTotal: 11,
          capacityAvailable: 11,
          bookingCutoffAt: "2026-07-27T06:00:00.000Z",
          isInstantConfirmation: true,
          isBookable: true,
          locationId: null
        }
      ],
      "2026-07-26",
      TZ,
      2,
      Date.parse("2026-07-20T10:00:00.000Z")
    );

    expect(slots).toHaveLength(1);
    expect(slots[0]?.id).toBe("11111111-1111-4111-8111-111111111111");
    expect(slots[0]?.localStartLabel).toBe("10:00");
    expect(slots[0]?.capacityRemaining).toBe(11);
  });
});

describe("classifyDayAvailability", () => {
  it("marks good availability when plenty of seats remain", () => {
    expect(
      classifyDayAvailability({
        capacityTotal: 20,
        capacityAvailable: 12,
        hasBookableSlot: true
      })
    ).toBe("good");
  });

  it("marks limited when remaining seats are low", () => {
    expect(
      classifyDayAvailability({
        capacityTotal: 11,
        capacityAvailable: 2,
        hasBookableSlot: true
      })
    ).toBe("limited");
  });

  it("marks full when no bookable capacity remains", () => {
    expect(
      classifyDayAvailability({
        capacityTotal: 11,
        capacityAvailable: 0,
        hasBookableSlot: false
      })
    ).toBe("full");
  });
});

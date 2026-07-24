import { describe, expect, it } from "vitest";
import {
  filterSlotsForLocalDate,
  formatLocalStartLabel,
  getLocalDateKey,
  isSlotEligibleForParty
} from "./filter";

const TZ = "Europe/Madrid";

describe("availability filter helpers", () => {
  it("maps UTC instants to the local calendar date", () => {
    // 2026-07-26 10:00 Madrid = 08:00 UTC in summer
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
      capacityReserved: 0,
      bookingCutoffAt: "2026-07-26T06:00:00.000Z",
      isInstantConfirmation: true,
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
      capacityReserved: 10,
      bookingCutoffAt: "2026-07-26T06:00:00.000Z",
      isInstantConfirmation: true,
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
          capacityReserved: 0,
          bookingCutoffAt: "2026-07-26T06:00:00.000Z",
          isInstantConfirmation: true
        },
        {
          id: "22222222-2222-4222-8222-222222222222",
          startsAt: "2026-07-27T08:00:00.000Z",
          endsAt: "2026-07-27T11:00:00.000Z",
          timezone: TZ,
          status: "scheduled",
          capacityTotal: 11,
          capacityReserved: 0,
          bookingCutoffAt: "2026-07-27T06:00:00.000Z",
          isInstantConfirmation: true
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

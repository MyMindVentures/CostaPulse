import { describe, expect, it } from "vitest";
import {
  availabilityCtaTypes,
  availabilityEntryTypes,
  availabilityStatuses,
  getAvailabilityStatusSemantic,
  parsePublicAvailabilityEntries
} from "./team-member-availability";

const baseEntry = {
  id: "65fbc0c4-98bb-4ab2-8436-22d51937f2bb",
  dateKey: "2026-08-10",
  startsAt: "2026-08-10T08:00:00+02:00",
  endsAt: "2026-08-10T17:00:00+02:00",
  timezone: "Europe/Madrid",
  isAllDay: false,
  title: "Captain availability",
  summary: null,
  locationLabel: "Western Europe",
  geographicScope: "europe",
  travelAvailable: true,
  capacityTotal: null,
  capacityReserved: 0,
  capacityRemaining: null,
  service: null,
  experience: null,
  cta: {
    type: "request_availability",
    label: "Request availability",
    path: "/contact"
  }
};

describe("public team-member availability contract", () => {
  it("accepts every backend status and maps each to shared semantics", () => {
    const parsed = parsePublicAvailabilityEntries(
      availabilityStatuses.map((status, index) => ({
        ...baseEntry,
        id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
        status,
        entryType: availabilityEntryTypes[index % availabilityEntryTypes.length]
      }))
    );

    expect(parsed).toHaveLength(availabilityStatuses.length);
    expect(
      parsed.map((entry) => getAvailabilityStatusSemantic(entry.status))
    ).toHaveLength(availabilityStatuses.length);
  });

  it("accepts every entry and CTA enum value", () => {
    for (const entryType of availabilityEntryTypes) {
      for (const ctaType of availabilityCtaTypes) {
        expect(
          parsePublicAvailabilityEntries([
            {
              ...baseEntry,
              status: "available",
              entryType,
              cta: { ...baseEntry.cta, type: ctaType }
            }
          ])[0]
        ).toMatchObject({ entryType, cta: { type: ctaType } });
      }
    }
  });

  it("rejects private or incompatible response fields", () => {
    expect(() =>
      parsePublicAvailabilityEntries([
        {
          ...baseEntry,
          status: "scheduled",
          entryType: "availability",
          internal_notes: "private"
        }
      ])
    ).toThrow();
  });
});

import { describe, expect, it } from "vitest";
import {
  mapExperienceCalendarRow,
  parseExperienceCalendarRows,
  type ExperienceCalendarRpcRow
} from "./experience-calendar";

function baseRow(
  overrides: Partial<ExperienceCalendarRpcRow> = {}
): ExperienceCalendarRpcRow {
  return {
    slot_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    experience_id: "11111111-1111-4111-8111-111111111111",
    experience_variant_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    variant_name: "Private boat",
    location_id: "22222222-2222-4222-8222-222222222222",
    location_name: "Altea",
    latitude: 38.6,
    longitude: -0.05,
    starts_at: "2026-08-01T17:00:00+02:00",
    ends_at: "2026-08-01T20:00:00+02:00",
    timezone: "Europe/Madrid",
    capacity_total: 8,
    capacity_reserved: 2,
    capacity_available: 6,
    status: "scheduled",
    booking_cutoff_at: "2026-08-01T15:00:00+02:00",
    is_instant_confirmation: true,
    assigned_team_members: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        slug: "alex",
        displayName: "Alex",
        roleTitle: "Skipper",
        photoPath: null,
        isPrimary: true,
        roleLabel: null
      }
    ],
    ...overrides
  };
}

describe("mapExperienceCalendarRow", () => {
  it("maps a complete calendar slot", () => {
    const slot = mapExperienceCalendarRow(baseRow());

    expect(slot.slotId).toBe("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(slot.variant).toEqual({
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      name: "Private boat"
    });
    expect(slot.capacity).toEqual({
      total: 8,
      reserved: 2,
      available: 6
    });
    expect(slot.teamMembers).toHaveLength(1);
    expect(slot.isInstantConfirmation).toBe(true);
  });

  it("handles sold-out slots without location or team", () => {
    const slot = mapExperienceCalendarRow(
      baseRow({
        status: "sold_out",
        capacity_available: 0,
        capacity_reserved: 8,
        location_id: null,
        location_name: null,
        latitude: null,
        longitude: null,
        assigned_team_members: [],
        booking_cutoff_at: null,
        is_instant_confirmation: false
      })
    );

    expect(slot.status).toBe("sold_out");
    expect(slot.capacity.available).toBe(0);
    expect(slot.location).toEqual({
      id: null,
      name: null,
      latitude: null,
      longitude: null
    });
    expect(slot.teamMembers).toEqual([]);
    expect(slot.bookingCutoffAt).toBeNull();
  });
});

describe("parseExperienceCalendarRows", () => {
  it("returns empty when there are no slots", () => {
    expect(parseExperienceCalendarRows([])).toEqual([]);
  });

  it("skips invalid rows", () => {
    const slots = parseExperienceCalendarRows([baseRow(), { slot_id: "x" }]);
    expect(slots).toHaveLength(1);
  });
});

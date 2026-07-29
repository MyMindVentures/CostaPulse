import { describe, expect, it } from "vitest";
import { teamMemberAvailabilityInputSchema } from "./admin-schema";

const input = {
  id: null,
  team_member_id: "00000000-0000-4000-8000-000000000001",
  professional_service_id: null,
  experience_id: null,
  experience_variant_id: null,
  availability_slot_id: null,
  entry_type: "manual_availability" as const,
  status: "available" as const,
  starts_at: "2026-08-10T08:00:00.000Z",
  ends_at: "2026-08-10T12:00:00.000Z",
  timezone: "Europe/Madrid",
  is_all_day: false,
  public_title: "Available for requests",
  public_summary: null,
  public_location_label: "Costa Blanca",
  location_id: null,
  geographic_scope: "Spain",
  travel_available: true,
  capacity_total: 4,
  capacity_reserved: 0,
  visibility: "public" as const,
  cta_type: "request_availability" as const,
  cta_path: "/contact",
  internal_notes: null,
  metadata: {}
};

describe("team member availability admin schema", () => {
  it("accepts the exact persisted column contract", () => {
    expect(teamMemberAvailabilityInputSchema.parse(input)).toEqual(input);
  });

  it("rejects inverted ranges and invalid capacities", () => {
    const parsed = teamMemberAvailabilityInputSchema.safeParse({
      ...input,
      ends_at: input.starts_at,
      capacity_total: 1,
      capacity_reserved: 2
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(["ends_at", "capacity_reserved"])
      );
    }
  });

  it("requires source records for source-backed entry types", () => {
    expect(
      teamMemberAvailabilityInputSchema.safeParse({
        ...input,
        entry_type: "professional_service"
      }).success
    ).toBe(false);
    expect(
      teamMemberAvailabilityInputSchema.safeParse({
        ...input,
        entry_type: "experience"
      }).success
    ).toBe(false);
  });
});

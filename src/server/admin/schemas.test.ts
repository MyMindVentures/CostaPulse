import { describe, expect, it } from "vitest";
import {
  AdminApiError,
  adminBookingsPageSchema,
  adminCalendarListSchema,
  adminCustomerDetailSchema,
  adminDashboardOverviewSchema,
  adminReferenceDataSchema
} from "./schemas";

describe("adminDashboardOverviewSchema", () => {
  it("parses overview metrics with coerced numbers", () => {
    const result = adminDashboardOverviewSchema.parse({
      period: {
        from: "2026-07-01T00:00:00+00:00",
        to: "2026-07-25T12:00:00+00:00"
      },
      bookings_total: "12",
      bookings_confirmed: 8,
      pending_manual_confirmation: 2,
      paid_revenue_minor: 495000,
      refunds_minor: 0,
      upcoming_slots: 5,
      failed_payments: 1,
      customers_total: 40,
      partners_active: 3,
      reviews_pending: 0
    });

    expect(result.bookings_total).toBe(12);
    expect(result.paid_revenue_minor).toBe(495000);
  });
});

describe("adminBookingsPageSchema", () => {
  it("parses a paginated booking list", () => {
    const result = adminBookingsPageSchema.parse({
      items: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          booking_reference: "CP-1001",
          status: "confirmed",
          payment_status: "paid",
          party_size: 4,
          currency: "EUR",
          total_amount_minor: 49500,
          created_at: "2026-07-20T10:00:00+00:00",
          experience_title_snapshot: "Sunset sail"
        }
      ],
      page: 1,
      page_size: 25,
      total: 1,
      page_count: 1
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.booking_reference).toBe("CP-1001");
  });

  it("rejects invalid booking status", () => {
    expect(() =>
      adminBookingsPageSchema.parse({
        items: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            booking_reference: "CP-1001",
            status: "not-a-status",
            payment_status: "paid",
            party_size: 2,
            currency: "EUR",
            total_amount_minor: 100,
            created_at: "2026-07-20T10:00:00+00:00"
          }
        ],
        page: 1,
        page_size: 25,
        total: 1,
        page_count: 1
      })
    ).toThrow();
  });
});

describe("adminCalendarListSchema", () => {
  it("parses calendar slots", () => {
    const result = adminCalendarListSchema.parse([
      {
        availability_slot_id: "22222222-2222-4222-8222-222222222222",
        experience_id: "33333333-3333-4333-8333-333333333333",
        experience_title: "Paddle",
        starts_at: "2026-07-26T09:00:00+02:00",
        ends_at: "2026-07-26T11:00:00+02:00",
        status: "scheduled",
        capacity_total: 8,
        capacity_reserved: 2,
        capacity_available: 6,
        assigned_team: []
      }
    ]);

    expect(result[0]?.capacity_available).toBe(6);
  });
});

describe("adminCustomerDetailSchema", () => {
  it("defaults nested collections", () => {
    const result = adminCustomerDetailSchema.parse({
      id: "44444444-4444-4444-8444-444444444444",
      email: "guest@example.com",
      created_at: "2026-01-01T00:00:00+00:00"
    });

    expect(result.bookings).toEqual([]);
    expect(result.vouchers).toEqual([]);
    expect(result.reviews).toEqual([]);
  });
});

describe("adminReferenceDataSchema", () => {
  it("parses filter reference lists", () => {
    const result = adminReferenceDataSchema.parse({
      experiences: [
        {
          id: "55555555-5555-4555-8555-555555555555",
          slug: "sunset",
          title: "Sunset",
          status: "published"
        }
      ],
      variants: [],
      locations: [],
      team_members: [],
      partners: [],
      roles: ["administrator"]
    });

    expect(result.experiences[0]?.slug).toBe("sunset");
  });
});

describe("AdminApiError", () => {
  it("carries status and optional code", () => {
    const error = new AdminApiError("Forbidden", 403, "42501");
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(403);
    expect(error.code).toBe("42501");
  });
});

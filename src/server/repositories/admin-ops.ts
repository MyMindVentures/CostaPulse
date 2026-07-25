import "server-only";

import { callAdminApi } from "@/server/admin/api-client";
import {
  adminBookingsPageSchema,
  adminBookingDetailSchema,
  adminBookingRowSchema,
  adminCalendarListSchema,
  adminCustomerDetailSchema,
  adminCustomersPageSchema,
  adminDashboardOverviewSchema,
  adminReferenceDataSchema,
  adminSlotRowSchema,
  bookingStatusSchema,
  type AdminBookingDetail,
  type AdminBookingsPage,
  type AdminCalendarItem,
  type AdminCustomerDetail,
  type AdminCustomersPage,
  type AdminDashboardOverview,
  type AdminReferenceData,
  type AdminBookingListItem
} from "@/server/admin/schemas";
import { z } from "zod";

export type {
  AdminBookingDetail,
  AdminBookingsPage,
  AdminCalendarItem,
  AdminCustomerDetail,
  AdminCustomersPage,
  AdminDashboardOverview,
  AdminReferenceData,
  AdminBookingListItem
};

export async function fetchAdminDashboardOverview(input?: {
  from?: string;
  to?: string;
}): Promise<AdminDashboardOverview> {
  return callAdminApi({
    body: {
      action: "dashboard_overview",
      from: input?.from,
      to: input?.to
    },
    schema: adminDashboardOverviewSchema
  });
}

export async function fetchAdminReferenceData(): Promise<AdminReferenceData> {
  return callAdminApi({
    body: { action: "reference_data" },
    schema: adminReferenceDataSchema
  });
}

export type AdminBookingsQuery = {
  page?: number;
  pageSize?: number;
  search?: string | null;
  status?: z.infer<typeof bookingStatusSchema> | null;
  paymentStatus?: string | null;
  experienceId?: string | null;
  locationId?: string | null;
  from?: string | null;
  to?: string | null;
};

export async function fetchAdminBookings(
  query: AdminBookingsQuery = {}
): Promise<AdminBookingsPage> {
  return callAdminApi({
    body: {
      action: "list_bookings",
      page: query.page ?? 1,
      page_size: query.pageSize ?? 25,
      search: query.search ?? null,
      status: query.status ?? null,
      payment_status: query.paymentStatus ?? null,
      experience_id: query.experienceId ?? null,
      location_id: query.locationId ?? null,
      from: query.from ?? null,
      to: query.to ?? null
    },
    schema: adminBookingsPageSchema
  });
}

export async function fetchAdminBookingDetail(
  bookingId: string
): Promise<AdminBookingDetail> {
  return callAdminApi({
    body: { action: "booking_detail", booking_id: bookingId },
    schema: adminBookingDetailSchema
  });
}

export async function updateAdminBookingStatus(input: {
  bookingId: string;
  status: z.infer<typeof bookingStatusSchema>;
  reason?: string | null;
}) {
  return callAdminApi({
    body: {
      action: "update_booking_status",
      booking_id: input.bookingId,
      status: input.status,
      reason: input.reason ?? null
    },
    schema: adminBookingRowSchema
  });
}

export async function fetchAdminCustomers(input?: {
  page?: number;
  pageSize?: number;
  search?: string | null;
}): Promise<AdminCustomersPage> {
  return callAdminApi({
    body: {
      action: "list_customers",
      page: input?.page ?? 1,
      page_size: input?.pageSize ?? 25,
      search: input?.search ?? null
    },
    schema: adminCustomersPageSchema
  });
}

export async function fetchAdminCustomerDetail(
  customerId: string
): Promise<AdminCustomerDetail> {
  return callAdminApi({
    body: { action: "customer_detail", customer_id: customerId },
    schema: adminCustomerDetailSchema
  });
}

export async function fetchAdminCalendar(input: {
  from: string;
  to: string;
  experienceId?: string | null;
  locationId?: string | null;
  teamMemberId?: string | null;
}): Promise<AdminCalendarItem[]> {
  return callAdminApi({
    body: {
      action: "list_calendar",
      from: input.from,
      to: input.to,
      experience_id: input.experienceId ?? null,
      location_id: input.locationId ?? null,
      team_member_id: input.teamMemberId ?? null
    },
    schema: adminCalendarListSchema
  });
}

export async function upsertAdminSlot(input: {
  id?: string | null;
  payload: Record<string, unknown>;
}) {
  return callAdminApi({
    body: {
      action: "upsert_slot",
      id: input.id ?? null,
      payload: input.payload
    },
    schema: adminSlotRowSchema
  });
}

export async function assignAdminSlotTeam(input: {
  slotId: string;
  teamMembers: Array<{
    team_member_id: string;
    role_label?: string;
    is_primary?: boolean;
  }>;
}) {
  return callAdminApi({
    body: {
      action: "assign_slot_team",
      slot_id: input.slotId,
      team_members: input.teamMembers
    },
    schema: z.array(z.record(z.string(), z.unknown()))
  });
}

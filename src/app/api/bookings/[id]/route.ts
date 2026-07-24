import { NextResponse } from "next/server";
import { z } from "zod";
import { getBookingDetailForAccess } from "@/server/bookings/service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const querySchema = z.object({
  email: z.email().optional(),
  sessionId: z.string().uuid().optional()
});

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    email: url.searchParams.get("email") ?? undefined,
    sessionId: url.searchParams.get("sessionId") ?? undefined
  });

  if (!parsed.success || (!parsed.data.email && !parsed.data.sessionId)) {
    return NextResponse.json(
      {
        status: "invalid_request",
        error: "Provide email or sessionId to access this booking."
      },
      { status: 400 }
    );
  }

  const result = await getBookingDetailForAccess({
    bookingId: id,
    accessEmail: parsed.data.email,
    anonymousSessionId: parsed.data.sessionId
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        status: "error",
        code: result.code,
        error: result.message
      },
      { status: result.status }
    );
  }

  return NextResponse.json({
    status: "ok",
    booking: {
      id: result.booking.id,
      bookingReference: result.booking.booking_reference,
      status: result.booking.status,
      paymentStatus: result.booking.payment_status,
      currency: result.booking.currency,
      totalAmountMinor: result.booking.total_amount_minor,
      subtotalAmountMinor: result.booking.subtotal_amount_minor,
      voucherAmountMinor: result.booking.voucher_amount_minor,
      partySize: result.booking.party_size,
      customerEmail: result.booking.customer_email,
      contactFirstName: result.booking.contact_first_name,
      contactLastName: result.booking.contact_last_name,
      preferredLanguage: result.booking.preferred_language,
      specialRequests: result.booking.special_requests,
      experienceTitle: result.booking.experience_title_snapshot,
      variantName: result.booking.variant_name_snapshot,
      locationName: result.booking.location_name_snapshot,
      startsAt: result.booking.starts_at_snapshot,
      endsAt: result.booking.ends_at_snapshot,
      timezone: result.booking.timezone_snapshot,
      expiresAt: result.booking.expires_at,
      priceLines: result.booking.price_lines,
      participants: result.booking.participants,
      addons: result.booking.addons,
      cancellationPolicy: result.booking.cancellation_policy_snapshot
    }
  });
}

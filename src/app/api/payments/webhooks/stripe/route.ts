import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { getBookingUpdateForStripeEvent } from "@/server/payments/stripe-webhooks";
import type { Json } from "@/types/database";

export const dynamic = "force-dynamic";

function extractBookingIdFromEvent(event: Stripe.Event) {
  const metadata = (
    event.data.object as unknown as { metadata?: Record<string, unknown> }
  ).metadata;
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const bookingId = (metadata as Record<string, unknown>).bookingId;
  return typeof bookingId === "string" && bookingId.length > 0
    ? bookingId
    : null;
}

function extractProviderPaymentId(event: Stripe.Event) {
  const object = event.data.object as { id?: string };
  return typeof object.id === "string" ? object.id : null;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!stripe || !webhookSecret || !signature) {
    return NextResponse.json(
      {
        status: "not_configured",
        error: "Stripe webhook processing is not configured."
      },
      { status: 503 }
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      {
        status: "invalid_signature",
        error: "Stripe webhook signature verification failed."
      },
      { status: 400 }
    );
  }

  const bookingUpdate = getBookingUpdateForStripeEvent(event.type);
  if (!bookingUpdate) {
    return NextResponse.json({ status: "ignored", eventType: event.type });
  }

  const bookingId = extractBookingIdFromEvent(event);
  if (!bookingId) {
    return NextResponse.json({
      status: "ignored",
      reason: "missing_booking_id"
    });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      {
        status: "not_configured",
        error: "Supabase admin client is not configured."
      },
      { status: 503 }
    );
  }

  const { data: existingEvent } = await supabase
    .from("payment_events")
    .select("id, processed_at")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  if (existingEvent?.processed_at) {
    return NextResponse.json({ status: "duplicate", eventId: event.id });
  }

  const eventPayload = JSON.parse(JSON.stringify(event)) as Json;

  if (!existingEvent) {
    const { error: insertEventError } = await supabase
      .from("payment_events")
      .insert({
        booking_id: bookingId,
        stripe_event_id: event.id,
        stripe_event_type: event.type,
        payload: eventPayload
      });

    if (insertEventError) {
      return NextResponse.json(
        {
          status: "event_record_failed",
          error: "The payment event could not be stored."
        },
        { status: 503 }
      );
    }
  }

  const now = new Date().toISOString();
  const providerPaymentId = extractProviderPaymentId(event);

  if (event.type === "checkout.session.completed") {
    const { error: confirmError } = await supabase.rpc("confirm_paid_booking", {
      p_booking_id: bookingId,
      p_provider_payment_id: providerPaymentId ?? undefined
    });

    if (confirmError) {
      return NextResponse.json(
        {
          status: "booking_update_failed",
          error:
            "The payment event was received, but the booking could not be confirmed yet."
        },
        { status: 503 }
      );
    }
  } else {
    const bookingPatch: Record<string, string | null> = {
      payment_status: bookingUpdate.paymentStatus,
      status: bookingUpdate.bookingStatus
    };

    if (bookingUpdate.markCancelledAt) {
      bookingPatch.cancelled_at = now;
    }

    const { error: bookingError } = await supabase
      .from("bookings")
      .update(bookingPatch)
      .eq("id", bookingId);

    if (bookingError) {
      return NextResponse.json(
        {
          status: "booking_update_failed",
          error:
            "The payment event was received, but the booking could not be updated yet."
        },
        { status: 503 }
      );
    }
  }

  await supabase
    .from("payment_events")
    .update({ processed_at: now })
    .eq("stripe_event_id", event.id);

  return NextResponse.json({
    status: "processed",
    eventId: event.id,
    bookingId
  });
}

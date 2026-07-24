import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { mapBookingRpcError } from "./schema";

type CheckoutSuccess = {
  ok: true;
  status: 200;
  checkoutUrl: string;
  sessionId: string;
};

type CheckoutFailure = {
  ok: false;
  status: 400 | 403 | 404 | 409 | 503;
  code: string;
  message: string;
};

export type CheckoutResult = CheckoutSuccess | CheckoutFailure;

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export async function createBookingCheckoutSession(input: {
  bookingId: string;
  experienceSlug: string;
  accessEmail?: string;
  anonymousSessionId?: string;
}): Promise<CheckoutResult> {
  if (!stripe) {
    return {
      ok: false,
      status: 503,
      code: "STRIPE_NOT_CONFIGURED",
      message: "Stripe is not configured."
    };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      ok: false,
      status: 503,
      code: "SUPABASE_NOT_CONFIGURED",
      message: "Supabase admin client is not configured."
    };
  }

  const { data: booking, error } = await supabase
    .from("booking_detail")
    .select("*")
    .eq("id", input.bookingId)
    .maybeSingle();

  if (error || !booking || !booking.id) {
    return {
      ok: false,
      status: 404,
      code: "BOOKING_NOT_FOUND",
      message: "The booking could not be found."
    };
  }

  const emailOk =
    input.accessEmail &&
    booking.customer_email?.toLowerCase() === input.accessEmail.toLowerCase();

  let sessionOk = false;
  if (input.anonymousSessionId) {
    const { data: hold } = await supabase
      .from("booking_holds")
      .select("id")
      .eq("booking_id", input.bookingId)
      .eq("anonymous_session_id", input.anonymousSessionId)
      .maybeSingle();
    sessionOk = Boolean(hold);
  }

  if (!emailOk && !sessionOk) {
    return {
      ok: false,
      status: 403,
      code: "NOT_AUTHORIZED",
      message: "You are not allowed to pay for this booking."
    };
  }

  if (
    booking.status !== "pending_payment" ||
    booking.payment_status !== "unpaid"
  ) {
    return {
      ok: false,
      status: 409,
      code: "INVALID_BOOKING_STATUS",
      message: "This booking is not ready for payment."
    };
  }

  if (
    booking.expires_at &&
    new Date(booking.expires_at).getTime() <= Date.now()
  ) {
    return {
      ok: false,
      status: 409,
      code: "BOOKING_EXPIRED",
      message: "This booking hold has expired."
    };
  }

  const currency = (booking.currency ?? "EUR").toLowerCase();
  const amount = booking.total_amount_minor ?? 0;
  if (amount <= 0) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_AMOUNT",
      message: "The booking total is invalid."
    };
  }

  const lineItems =
    Array.isArray(booking.price_lines) && booking.price_lines.length > 0
      ? (
          booking.price_lines as Array<{
            label?: string;
            quantity?: number;
            unit_amount_minor?: number;
            total_amount_minor?: number;
          }>
        ).map((line) => ({
          quantity: line.quantity && line.quantity > 0 ? line.quantity : 1,
          price_data: {
            currency,
            unit_amount:
              typeof line.unit_amount_minor === "number"
                ? line.unit_amount_minor
                : amount,
            product_data: {
              name:
                line.label ||
                booking.experience_title_snapshot ||
                "CostaPulse experience"
            }
          }
        }))
      : [
          {
            quantity: 1,
            price_data: {
              currency,
              unit_amount: amount,
              product_data: {
                name:
                  booking.experience_title_snapshot || "CostaPulse experience"
              }
            }
          }
        ];

  const successUrl = `${siteUrl()}/book/${encodeURIComponent(input.experienceSlug)}/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${siteUrl()}/book/${encodeURIComponent(input.experienceSlug)}/cancel?bookingId=${encodeURIComponent(input.bookingId)}`;

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: booking.customer_email ?? undefined,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        bookingId: booking.id
      },
      payment_intent_data: {
        metadata: {
          bookingId: booking.id
        }
      }
    });
  } catch {
    return {
      ok: false,
      status: 503,
      code: "STRIPE_SESSION_FAILED",
      message: "Stripe Checkout could not be started."
    };
  }

  if (!session.url) {
    return {
      ok: false,
      status: 503,
      code: "STRIPE_SESSION_FAILED",
      message: "Stripe Checkout did not return a redirect URL."
    };
  }

  const { error: processingError } = await supabase.rpc(
    "mark_booking_payment_processing",
    {
      p_booking_id: booking.id,
      p_provider_payment_id: session.id
    }
  );

  if (processingError) {
    const mapped = mapBookingRpcError(processingError.message);
    return {
      ok: false,
      status: mapped.status === 403 ? 409 : mapped.status,
      code: mapped.code,
      message: processingError.message
    };
  }

  return {
    ok: true,
    status: 200,
    checkoutUrl: session.url,
    sessionId: session.id
  };
}

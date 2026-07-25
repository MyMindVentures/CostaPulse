import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getVoucherForBooking } from "@/server/referrals/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId || sessionId.length > 255 || !stripe) {
    return NextResponse.json({ status: "invalid_request" }, { status: 400 });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const bookingId = session.metadata?.bookingId;
    const supabase = createSupabaseAdminClient();
    if (!bookingId || !supabase) {
      return NextResponse.json({ status: "not_found" }, { status: 404 });
    }
    const { data: booking } = await supabase
      .from("bookings")
      .select("payment_status, partner_id")
      .eq("id", bookingId)
      .maybeSingle();
    if (!booking) {
      return NextResponse.json({ status: "not_found" }, { status: 404 });
    }
    if (!booking.partner_id) {
      return NextResponse.json({ status: "not_applicable" });
    }
    const voucher = await getVoucherForBooking(bookingId);
    if (voucher) {
      return NextResponse.json({ status: "issued", voucher });
    }
    return NextResponse.json({
      status: booking.payment_status === "paid" ? "failed" : "pending"
    });
  } catch {
    return NextResponse.json({ status: "not_found" }, { status: 404 });
  }
}

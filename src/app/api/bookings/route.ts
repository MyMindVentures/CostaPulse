import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createBookingInputSchema } from "@/server/bookings/schema";
import { createExperienceBooking } from "@/server/bookings/service";
import {
  hashReferralToken,
  REFERRAL_SESSION_COOKIE
} from "@/server/referrals/cookies";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = createBookingInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "invalid_request",
        error: "The booking payload is invalid.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const referralSessionToken = cookieStore.get(REFERRAL_SESSION_COOKIE)?.value;
  const result = await createExperienceBooking(
    parsed.data,
    referralSessionToken ? hashReferralToken(referralSessionToken) : undefined
  );
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

  return NextResponse.json(
    {
      status: "created",
      booking: result.booking
    },
    { status: result.status }
  );
}

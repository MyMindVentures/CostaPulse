import { NextResponse, type NextRequest } from "next/server";
import {
  createOpaqueToken,
  hashReferralToken,
  referralCookieOptions,
  REFERRAL_SESSION_COOKIE
} from "@/server/referrals/cookies";
import { verifyReferralContact } from "@/server/referrals/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || token.length > 256) {
    return NextResponse.redirect(
      new URL("/referral/verification-unavailable", request.url),
      303
    );
  }
  const sessionToken = createOpaqueToken();
  try {
    await verifyReferralContact(
      hashReferralToken(token),
      hashReferralToken(sessionToken)
    );
    const response = NextResponse.redirect(
      new URL("/experiences?referral=verified", request.url),
      303
    );
    response.cookies.set(
      REFERRAL_SESSION_COOKIE,
      sessionToken,
      referralCookieOptions(60 * 60 * 24 * 30)
    );
    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/referral/verification-unavailable", request.url),
      303
    );
  }
}

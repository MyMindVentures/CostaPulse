import { NextResponse, type NextRequest } from "next/server";
import {
  createOpaqueToken,
  hashReferralToken,
  referralCookieOptions,
  REFERRAL_VISITOR_COOKIE
} from "@/server/referrals/cookies";
import { registerReferralVisit } from "@/server/referrals/service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partnerCode: string }> }
) {
  const { partnerCode } = await params;
  const visitorToken =
    request.cookies.get(REFERRAL_VISITOR_COOKIE)?.value ?? createOpaqueToken();

  try {
    const visit = await registerReferralVisit({
      partnerCode,
      visitorTokenHash: hashReferralToken(visitorToken)
    });
    const response = NextResponse.redirect(
      new URL(`/referral/${visit.visitToken}`, request.url),
      303
    );
    response.cookies.set(
      REFERRAL_VISITOR_COOKIE,
      visitorToken,
      referralCookieOptions(60 * 60 * 24 * 365)
    );
    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/referral/unavailable", request.url),
      303
    );
  }
}

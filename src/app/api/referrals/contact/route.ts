import { NextResponse, type NextRequest } from "next/server";
import {
  createOpaqueToken,
  hashReferralToken
} from "@/server/referrals/cookies";
import { referralContactInputSchema } from "@/server/referrals/schema";
import {
  recordVerificationEmailOutcome,
  submitReferralContact
} from "@/server/referrals/service";
import { sendReferralVerificationEmail } from "@/server/referrals/verification-email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const parsed = referralContactInputSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "invalid_request",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      },
      { status: 400 }
    );
  }

  const token = createOpaqueToken();
  const tokenHash = hashReferralToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  try {
    const result = await submitReferralContact(
      parsed.data,
      tokenHash,
      expiresAt
    );
    if (typeof result.partner_name !== "string") {
      throw new Error("Partner name was missing from verification response.");
    }
    const partnerName = result.partner_name;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      return NextResponse.json(
        { status: "site_url_not_configured" },
        { status: 503 }
      );
    }
    const verificationUrl = new URL("/api/referrals/verify", siteUrl);
    verificationUrl.searchParams.set("token", token);
    const emailResult = await sendReferralVerificationEmail({
      to: parsed.data.email,
      locale: parsed.data.locale,
      firstName: parsed.data.firstName,
      partnerName,
      verificationUrl: verificationUrl.toString()
    });
    await recordVerificationEmailOutcome({
      verificationTokenHash: tokenHash,
      succeeded: emailResult.ok,
      providerMessageId: emailResult.ok ? emailResult.id : undefined
    });
    if (!emailResult.ok) {
      return NextResponse.json({ status: "email_failed" }, { status: 503 });
    }
    return NextResponse.json({ status: "verification_sent" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("EXPIRED") ? 410 : 503;
    return NextResponse.json({ status: "error" }, { status });
  }
}

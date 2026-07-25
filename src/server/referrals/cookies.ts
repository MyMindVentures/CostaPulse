import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const REFERRAL_VISITOR_COOKIE = "cp_referral_visitor";
export const REFERRAL_SESSION_COOKIE = "cp_referral_session";

export function createOpaqueToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function hashReferralToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function referralCookieOptions(maxAge: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  };
}

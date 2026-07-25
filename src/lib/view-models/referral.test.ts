import { describe, expect, it } from "vitest";
import { toBookingReferralContext } from "./referral";

describe("toBookingReferralContext", () => {
  it("maps one eligible referral and verified customer details", () => {
    const result = toBookingReferralContext({
      customer: {
        id: "11111111-1111-4111-8111-111111111111",
        first_name: "Ana",
        last_name: "Costa",
        email: "ana@example.com",
        phone: null,
        preferred_language: "es"
      },
      eligible_partners: [
        {
          referral_id: "22222222-2222-4222-8222-222222222222",
          partner_id: "33333333-3333-4333-8333-333333333333",
          partner_name: "La Marina",
          business_type: "Restaurant",
          reward_basis_points: 1000,
          expires_at: "2026-08-20T10:00:00+00:00"
        }
      ],
      session_expires_at: "2026-08-20T10:00:00+00:00"
    });

    expect(result.verifiedCustomer?.email).toBe("ana@example.com");
    expect(result.eligiblePartners[0]).toMatchObject({
      partnerName: "La Marina",
      rewardBasisPoints: 1000
    });
  });

  it("does not lock contact details when no referral remains eligible", () => {
    expect(toBookingReferralContext(null)).toEqual({
      verifiedCustomer: null,
      eligiblePartners: []
    });
  });
});

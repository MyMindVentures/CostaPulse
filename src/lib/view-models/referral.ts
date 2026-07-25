import type { BookingReferralContext } from "@/features/booking/types";
import type { VerifiedReferralContext } from "@/server/referrals/schema";

export function toBookingReferralContext(
  context: VerifiedReferralContext | null
): BookingReferralContext {
  if (!context || context.eligible_partners.length === 0) {
    return { verifiedCustomer: null, eligiblePartners: [] };
  }
  return {
    verifiedCustomer: {
      firstName: context.customer.first_name ?? "",
      lastName: context.customer.last_name ?? "",
      email: context.customer.email,
      phone: context.customer.phone ?? ""
    },
    eligiblePartners: context.eligible_partners.map((partner) => ({
      referralId: partner.referral_id,
      partnerId: partner.partner_id,
      partnerName: partner.partner_name,
      businessType: partner.business_type,
      rewardBasisPoints: partner.reward_basis_points,
      expiresAt: partner.expires_at
    }))
  };
}

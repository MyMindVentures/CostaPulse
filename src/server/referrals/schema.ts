import { z } from "zod";

const promoStepSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1)
});

const promoFeatureSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1)
});

export const partnerPromoContentSchema = z.object({
  partnerKicker: z.string().trim().min(1),
  headlinePrimary: z.string().trim().min(1),
  headlineAccent: z.string().trim().min(1),
  intro: z.string().trim().min(1),
  scanLabel: z.string().trim().min(1),
  rewardTitle: z.string().trim().min(1),
  rewardDescription: z.string().trim().min(1),
  howTitle: z.string().trim().min(1),
  steps: z.array(promoStepSchema).length(4),
  customerBenefitsTitle: z.string().trim().min(1),
  customerBenefits: z.array(z.string().trim().min(1)).min(1),
  partnerBenefitsTitle: z.string().trim().min(1),
  partnerBenefits: z.array(z.string().trim().min(1)).min(1),
  supportTitle: z.string().trim().min(1),
  supportMessage: z.string().trim().min(1),
  features: z.array(promoFeatureSchema).length(4)
});

export type PartnerPromoContent = z.infer<typeof partnerPromoContentSchema>;

const referralMediaSchema = z.object({
  id: z.string().uuid(),
  bucket_id: z.string().min(1),
  storage_path: z.string().min(1),
  role: z.enum(["logo", "gallery"]),
  alt_text: z.string().nullable(),
  is_primary: z.boolean(),
  display_order: z.number().int()
});

const partnerSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  business_type: z.string().nullable(),
  voucher_percent_basis_points: z.number().int().min(0).max(10000)
});

export const publicReferralLandingSchema = z.object({
  visit_token: z.string().min(1),
  partner: partnerSummarySchema,
  content: partnerPromoContentSchema,
  media: z.array(referralMediaSchema)
});

export type PublicReferralLanding = z.infer<typeof publicReferralLandingSchema>;

export const verifiedReferralContextSchema = z.object({
  customer: z.object({
    id: z.string().uuid(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    email: z.email(),
    phone: z.string().nullable(),
    preferred_language: z.string().nullable()
  }),
  eligible_partners: z.array(
    z.object({
      referral_id: z.string().uuid(),
      partner_id: z.string().uuid(),
      partner_name: z.string().min(1),
      business_type: z.string().nullable(),
      reward_basis_points: z.number().int().min(0).max(10000),
      expires_at: z.iso.datetime({ offset: true })
    })
  ),
  session_expires_at: z.iso.datetime({ offset: true })
});

export type VerifiedReferralContext = z.infer<
  typeof verifiedReferralContextSchema
>;

export const referralContactInputSchema = z.object({
  visitToken: z.string().trim().min(16).max(128),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.email().transform((value) => value.trim().toLowerCase()),
  phone: z.string().trim().min(5).max(40).optional(),
  locale: z.enum(["en", "nl", "fr", "es", "de"]),
  marketingConsent: z.boolean().default(false),
  whatsappConsent: z.boolean().default(false)
});

export type ReferralContactInput = z.infer<typeof referralContactInputSchema>;

export const issuedVoucherSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  booking_id: z.string().uuid(),
  voucher_amount_minor: z.number().int().nonnegative(),
  currency: z.string().min(3).max(3),
  status: z.enum(["issued", "redeemed", "expired", "cancelled"]),
  issued_at: z.iso.datetime({ offset: true }).nullable(),
  expires_at: z.iso.datetime({ offset: true }),
  partner: z.object({
    id: z.string().uuid(),
    name: z.string().min(1)
  })
});

export type IssuedVoucher = z.infer<typeof issuedVoucherSchema>;

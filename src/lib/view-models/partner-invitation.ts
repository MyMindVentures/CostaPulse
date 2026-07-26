import { z } from "zod";
import { getPublicStorageUrl } from "@/lib/media/experience-media";

export const partnerInvitationRpcRowSchema = z.object({
  partner_id: z.string().uuid(),
  partner_slug: z.string().min(1),
  partner_name: z.string().min(1),
  partner_description: z.string().nullable(),
  business_type: z.string().nullable(),
  website_url: z.string().url().nullable(),
  location_name: z.string().nullable(),
  location_city: z.string().nullable(),
  location_province: z.string().nullable(),
  location_country_code: z.string().length(2).nullable(),
  outreach_subject: z.string().min(1),
  invitation_body: z.string().min(1),
  image_bucket_id: z.string().nullable(),
  image_storage_path: z.string().nullable(),
  image_alt_text: z.string().nullable(),
  logo_bucket_id: z.string().nullable(),
  logo_storage_path: z.string().nullable(),
  logo_alt_text: z.string().nullable()
});

export type PartnerInvitation = {
  partnerId: string;
  slug: string;
  name: string;
  description: string | null;
  businessType: string | null;
  websiteUrl: string | null;
  location: {
    name: string | null;
    city: string | null;
    province: string | null;
    countryCode: string | null;
  };
  outreachSubject: string;
  invitationBody: string;
  image: { url: string | null; alt: string };
  logo: { url: string | null; alt: string };
};

export function parsePartnerInvitation(
  rows: unknown,
  supabaseUrl?: string
): PartnerInvitation | null {
  const row = Array.isArray(rows) ? rows[0] : null;
  const result = partnerInvitationRpcRowSchema.safeParse(row);
  if (!result.success) return null;
  const data = result.data;

  return {
    partnerId: data.partner_id,
    slug: data.partner_slug,
    name: data.partner_name,
    description: data.partner_description,
    businessType: data.business_type,
    websiteUrl: data.website_url,
    location: {
      name: data.location_name,
      city: data.location_city,
      province: data.location_province,
      countryCode: data.location_country_code
    },
    outreachSubject: data.outreach_subject,
    invitationBody: data.invitation_body,
    image: {
      url: getPublicStorageUrl(
        data.image_bucket_id,
        data.image_storage_path,
        supabaseUrl
      ),
      alt: data.image_alt_text ?? data.partner_name
    },
    logo: {
      url: getPublicStorageUrl(
        data.logo_bucket_id,
        data.logo_storage_path,
        supabaseUrl
      ),
      alt: data.logo_alt_text ?? data.partner_name
    }
  };
}

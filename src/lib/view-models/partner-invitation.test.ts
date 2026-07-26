import { describe, expect, it } from "vitest";
import { parsePartnerInvitation } from "./partner-invitation";

const row = {
  partner_id: "3e2a96de-f107-4b7e-b17b-03fb90ef49bd",
  partner_slug: "restaurante-la-plata-casa-matilde",
  partner_name: "Restaurante La Plata Casa Matilde",
  partner_description: "A local restaurant.",
  business_type: "restaurant",
  website_url: "https://example.com",
  location_name: "Casa Matilde",
  location_city: "Alicante",
  location_province: "Alicante",
  location_country_code: "ES",
  outreach_subject: "Invitation",
  invitation_body: "First paragraph.\n\nSecond paragraph.",
  image_bucket_id: "partner-media",
  image_storage_path: "partners/casa/hero.jpg",
  image_alt_text: null,
  logo_bucket_id: null,
  logo_storage_path: null,
  logo_alt_text: null
};

describe("parsePartnerInvitation", () => {
  it("maps the narrow RPC result and resolves public media", () => {
    const invitation = parsePartnerInvitation(
      [row],
      "https://project.supabase.co"
    );

    expect(invitation).toMatchObject({
      partnerId: row.partner_id,
      slug: row.partner_slug,
      invitationBody: row.invitation_body,
      image: {
        url: "https://project.supabase.co/storage/v1/object/public/partner-media/partners/casa/hero.jpg",
        alt: row.partner_name
      },
      logo: { url: null, alt: row.partner_name }
    });
  });

  it.each([undefined, [], [{}], [{ ...row, invitation_body: "" }]])(
    "returns null for missing or unsafe data",
    (value) => expect(parsePartnerInvitation(value)).toBeNull()
  );
});

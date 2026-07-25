import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/media/experience-media", () => ({
  getPublicStorageUrl: (bucket: string, path: string) =>
    `https://storage.example/${bucket}/${path}`
}));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn()
}));

import { resolveReferralMedia } from "./service";
import type { PublicReferralLanding } from "./schema";

const landing: PublicReferralLanding = {
  visit_token: "visit-token",
  partner: {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "la-marina",
    name: "La Marina",
    business_type: "Restaurant",
    voucher_percent_basis_points: 1000
  },
  content: {
    partnerKicker: "Partner",
    headlinePrimary: "Book",
    headlineAccent: "Enjoy",
    intro: "{reward}",
    scanLabel: "Scan",
    rewardTitle: "{reward}",
    rewardDescription: "Reward",
    howTitle: "How",
    steps: Array.from({ length: 4 }, () => ({
      title: "Step",
      description: "Description"
    })),
    customerBenefitsTitle: "Customer",
    customerBenefits: ["Benefit"],
    partnerBenefitsTitle: "Partner",
    partnerBenefits: ["Benefit"],
    supportTitle: "Support",
    supportMessage: "Thanks",
    features: Array.from({ length: 4 }, () => ({
      title: "Feature",
      description: "Description"
    }))
  },
  media: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      bucket_id: "brand-assets",
      storage_path: "partners/logo.png",
      role: "logo",
      alt_text: null,
      is_primary: true,
      display_order: 0
    }
  ]
};

describe("resolveReferralMedia", () => {
  it("resolves verified storage data and truthful partner alt text", () => {
    expect(resolveReferralMedia(landing, "logo")).toEqual({
      url: "https://storage.example/brand-assets/partners/logo.png",
      alt: "La Marina"
    });
  });

  it("returns null instead of fabricated imagery", () => {
    expect(resolveReferralMedia(landing, "gallery")).toBeNull();
  });
});

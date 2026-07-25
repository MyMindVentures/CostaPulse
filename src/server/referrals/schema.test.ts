import { describe, expect, it } from "vitest";
import {
  partnerPromoContentSchema,
  referralContactInputSchema
} from "./schema";

const validContent = {
  partnerKicker: "Our partner",
  headlinePrimary: "Book an experience.",
  headlineAccent: "Enjoy even more.",
  intro: "Receive {reward} back.",
  scanLabel: "Scan me",
  rewardTitle: "Get {reward} back",
  rewardDescription: "On your booking.",
  howTitle: "How it works",
  steps: Array.from({ length: 4 }, (_, index) => ({
    title: `Step ${index + 1}`,
    description: "Description"
  })),
  customerBenefitsTitle: "Good for you",
  customerBenefits: ["Benefit"],
  partnerBenefitsTitle: "Good for us",
  partnerBenefits: ["Benefit"],
  supportTitle: "Support local",
  supportMessage: "Thank you",
  features: Array.from({ length: 4 }, (_, index) => ({
    title: `Feature ${index + 1}`,
    description: "Description"
  }))
};

describe("partnerPromoContentSchema", () => {
  it("accepts the complete localized content contract", () => {
    expect(partnerPromoContentSchema.parse(validContent)).toEqual(validContent);
  });

  it("rejects incomplete step content", () => {
    expect(() =>
      partnerPromoContentSchema.parse({
        ...validContent,
        steps: validContent.steps.slice(0, 3)
      })
    ).toThrow();
  });
});

describe("referralContactInputSchema", () => {
  it("normalizes email and keeps consents opt-in", () => {
    const parsed = referralContactInputSchema.parse({
      visitToken: "1234567890123456",
      firstName: " Ana ",
      lastName: " Costa ",
      email: "ANA@EXAMPLE.COM",
      locale: "es",
      marketingConsent: false,
      whatsappConsent: false
    });
    expect(parsed.email).toBe("ana@example.com");
    expect(parsed.marketingConsent).toBe(false);
    expect(parsed.whatsappConsent).toBe(false);
  });
});

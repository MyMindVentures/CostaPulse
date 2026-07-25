import type { Metadata } from "next";
import { ExperiencesPageFeature } from "@/features/experiences/experiences-page";
import { getVerifiedReferralContext } from "@/server/referrals/service";

export const metadata: Metadata = {
  title: "Costa Blanca Experiences | CostaPulse",
  description:
    "Explore private yacht trips, paddle adventures and personally hosted Costa Blanca experiences."
};

export default async function ExperiencesPage({
  searchParams
}: {
  searchParams: Promise<{ referral?: string }>;
}) {
  const { referral } = await searchParams;
  const context =
    referral === "verified" ? await getVerifiedReferralContext() : null;
  return (
    <ExperiencesPageFeature
      referralVerified={Boolean(
        context && context.eligible_partners.length > 0
      )}
    />
  );
}

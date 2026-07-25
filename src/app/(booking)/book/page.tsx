import { Suspense } from "react";
import { getLocale } from "next-intl/server";
import { getExperienceHeroImageSrc } from "@/lib/media/experience-media";
import { getPublishedExperienceCards } from "@/server/repositories/catalog";
import { BookingWizard } from "@/features/booking/booking-wizard";
import { toBookingReferralContext } from "@/lib/view-models/referral";
import { getVerifiedReferralContext } from "@/server/referrals/service";

export const dynamic = "force-dynamic";

export default async function BookIndexPage() {
  const locale = await getLocale();
  const [cards, verifiedReferral] = await Promise.all([
    getPublishedExperienceCards(undefined, locale),
    getVerifiedReferralContext()
  ]);
  const experiences = cards.map((card) => ({
    id: card.id,
    slug: card.slug,
    title: card.title,
    shortDescription: card.shortDescription,
    heroImageUrl:
      getExperienceHeroImageSrc(card.heroImagePath) ?? card.heroImagePath,
    startingPriceMinor: card.startingPriceMinor,
    currency: card.currency,
    pricingModel: card.pricingModel
  }));

  return (
    <Suspense fallback={null}>
      <BookingWizard
        mode="standalone"
        experiences={experiences}
        referralContext={toBookingReferralContext(verifiedReferral)}
      />
    </Suspense>
  );
}

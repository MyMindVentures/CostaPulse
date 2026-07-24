import { Suspense } from "react";
import { getExperienceHeroImageSrc } from "@/lib/media/experience-media";
import { getPublishedExperienceCards } from "@/server/repositories/catalog";
import { BookingWizard } from "@/features/booking/booking-wizard";

export const dynamic = "force-dynamic";

export default async function BookIndexPage() {
  const cards = await getPublishedExperienceCards();
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
      <BookingWizard mode="standalone" experiences={experiences} />
    </Suspense>
  );
}

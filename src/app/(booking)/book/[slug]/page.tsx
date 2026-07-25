import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BookingWizard } from "@/features/booking/booking-wizard";
import { getExperienceHeroImageSrc } from "@/lib/media/experience-media";
import {
  getPublishedExperienceBySlug,
  getPublishedExperienceCards
} from "@/server/repositories/catalog";

export const dynamic = "force-dynamic";

type BookExperiencePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BookExperiencePage({
  params
}: BookExperiencePageProps) {
  const { slug } = await params;
  const [experience, cards] = await Promise.all([
    getPublishedExperienceBySlug(slug),
    getPublishedExperienceCards()
  ]);

  if (!experience) notFound();

  const image =
    experience.media.find((item) => item.isHero && item.url)?.url ??
    experience.media.find((item) => item.url)?.url ??
    getExperienceHeroImageSrc(experience.heroImagePath);

  const primaryLocation =
    experience.locations.find((location) => location.isPrimary) ??
    experience.locations[0];

  return (
    <Suspense fallback={null}>
      <BookingWizard
        mode="experience"
        experiences={cards.map((card) => ({
          id: card.id,
          slug: card.slug,
          title: card.title,
          shortDescription: card.shortDescription,
          heroImageUrl:
            getExperienceHeroImageSrc(card.heroImagePath) ?? card.heroImagePath,
          startingPriceMinor: card.startingPriceMinor,
          currency: card.currency,
          pricingModel: card.pricingModel
        }))}
        experience={{
          id: experience.id,
          slug: experience.slug,
          title: experience.title,
          shortDescription: experience.shortDescription,
          imageUrl: image,
          timezone: experience.timezone,
          locationName: primaryLocation?.name ?? experience.locationName,
          languages: experience.languages.map((language) => ({
            code: language.code,
            displayName: language.displayName
          })),
          variants: experience.variants.map((variant) => ({
            id: variant.id,
            name: variant.name,
            unitAmountMinor: variant.unitAmountMinor,
            currency: variant.currency,
            pricingModel: variant.pricingModel,
            minPartySize: variant.minPartySize,
            maxPartySize: variant.maxPartySize,
            isDefault: variant.isDefault
          }))
        }}
      />
    </Suspense>
  );
}

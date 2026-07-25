import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ExperienceDetail } from "@/features/experiences/detail/experience-detail";
import { getExperienceHeroImageSrc } from "@/lib/media/experience-media";
import { getPublicExperienceBookingStories } from "@/server/repositories/booking-stories";
import { getPublishedExperienceBySlug } from "@/server/repositories/catalog";

type ExperiencePageProps = {
  params: Promise<{ slug: string }>;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.costapulse.club";

export async function generateMetadata({
  params
}: ExperiencePageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const experience = await getPublishedExperienceBySlug(slug, locale);

  if (!experience) {
    return { title: "Experience not found | CostaPulse" };
  }

  const description =
    experience.shortDescription ??
    `Discover ${experience.title} on the Costa Blanca.`;
  const ogImage =
    experience.media.find((item) => item.placementKey === "hero" && item.url)
      ?.url ??
    experience.media.find((item) => item.url)?.url ??
    getExperienceHeroImageSrc(experience.heroImagePath);
  const canonical = `${siteUrl.replace(/\/+$/, "")}/experiences/${experience.slug}`;

  return {
    title: `${experience.title} | CostaPulse`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${experience.title} | CostaPulse`,
      description,
      url: canonical,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined
    }
  };
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const [experience, bookingStories] = await Promise.all([
    getPublishedExperienceBySlug(slug, locale),
    getPublicExperienceBookingStories({
      experienceSlug: slug,
      limit: 6,
      offset: 0
    }).catch(() => ({ items: [], nextOffset: null }))
  ]);

  if (!experience) notFound();

  const image =
    experience.media.find((item) => item.placementKey === "hero" && item.url)
      ?.url ??
    experience.media.find((item) => item.url)?.url ??
    getExperienceHeroImageSrc(experience.heroImagePath);

  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: experience.title,
    description: experience.shortDescription ?? experience.description,
    url: `${siteUrl.replace(/\/+$/, "")}/experiences/${experience.slug}`,
    image: image ? [image] : undefined,
    address: experience.locationName
      ? {
          "@type": "PostalAddress",
          addressLocality: experience.locationName,
          addressCountry: "ES"
        }
      : undefined
  };

  if (
    experience.reviews.reviewCount > 0 &&
    experience.reviews.averageRating !== null
  ) {
    structuredData.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: experience.reviews.averageRating,
      reviewCount: experience.reviews.reviewCount,
      bestRating: 5,
      worstRating: 1
    };
  }

  if (experience.startingPriceMinor !== null && experience.currency) {
    structuredData.offers = {
      "@type": "Offer",
      priceCurrency: experience.currency,
      price: (experience.startingPriceMinor / 100).toFixed(2),
      availability: "https://schema.org/InStock"
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ExperienceDetail
        experience={experience}
        bookingStories={bookingStories}
      />
    </>
  );
}

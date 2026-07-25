import Image from "next/image";
import { Clock3, MapPin, Users } from "lucide-react";
import type { ExperienceDetailViewModel } from "@/server/repositories/catalog";
import { DetailGalleryStrip } from "./detail-gallery-strip";
import { RatingStars } from "./rating-stars";

type DetailHeroProps = {
  experience: ExperienceDetailViewModel;
};

function formatDurationLabel(experience: ExperienceDetailViewModel) {
  const namedDurations = [
    ...new Set(
      experience.variants
        .map((variant) => variant.name.trim())
        .filter((name) => name.length > 0)
    )
  ];

  if (namedDurations.length > 0) {
    return namedDurations.join(" · ");
  }

  return `${Math.round(experience.durationMinutes / 60)} Hours`;
}

export function DetailHero({ experience }: DetailHeroProps) {
  const hero =
    experience.media.find((item) => item.placementKey === "hero" && item.url) ??
    experience.media.find((item) => item.mediaType === "image" && item.url) ??
    null;

  const badge =
    experience.variants.find((variant) => variant.badgeLabel)?.badgeLabel ??
    experience.variants.find((variant) => variant.isDefault)?.badgeLabel ??
    null;

  return (
    <section className="xp-hero mx-2.5 min-h-0 sm:mx-4 lg:mx-auto lg:min-h-[min(72svh,42rem)]">
      {hero?.url ? (
        <Image
          src={hero.url}
          alt={hero.altText?.trim() || experience.title}
          fill
          priority
          className="xp-hero-image"
          sizes="100vw"
          style={{ objectPosition: `${hero.focalX}% ${hero.focalY}%` }}
        />
      ) : (
        <div className="xp-hero-fallback" aria-hidden />
      )}
      <div className="xp-hero-overlay" aria-hidden />

      <div className="xp-hero-content min-h-0 w-auto p-6 sm:p-8 lg:min-h-[min(72svh,42rem)]">
        {badge ? <span className="xp-hero-badge">{badge}</span> : null}
        <h1>{experience.title}</h1>
        {experience.shortDescription ? (
          <p className="xp-hero-subtitle">{experience.shortDescription}</p>
        ) : null}
        {experience.description ? (
          <p className="xp-hero-copy">
            {experience.description.slice(0, 220)}
            {experience.description.length > 220 ? "…" : ""}
          </p>
        ) : null}

        <div className="xp-hero-stats">
          <span>
            <Clock3 size={18} aria-hidden />
            {formatDurationLabel(experience)}
          </span>
          <span>
            <Users size={18} aria-hidden />
            1–{experience.baseCapacity} People
          </span>
          {experience.locationName ? (
            <span>
              <MapPin size={18} aria-hidden />
              {experience.locationName}
            </span>
          ) : null}
        </div>

        <RatingStars
          rating={experience.reviews.averageRating ?? 0}
          reviewCount={experience.reviews.reviewCount}
        />

        <DetailGalleryStrip media={experience.media} title={experience.title} />
      </div>
    </section>
  );
}

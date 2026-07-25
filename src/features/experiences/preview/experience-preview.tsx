import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  Anchor,
  ArrowRight,
  CalendarDays,
  Camera,
  Clock3,
  Flame,
  MapPin,
  Ship,
  Star,
  Sun,
  Users,
  Waves
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  resolveExperienceCardTone,
  takeHighlightFeatures
} from "@/features/experiences/from-price";
import { ExperienceHostAvatar } from "./experience-host-avatar";
import { ExperiencePreviewImage } from "./experience-preview-image";
import { FavoriteToggle } from "@/features/experiences/favorite-toggle";
import { formatDurationLabel } from "@/components/shared/duration-display";
import { formatPriceLabel } from "@/components/shared/price-display";
import { getTeamMemberPhotoUrl } from "@/lib/media/experience-media";
import type { ExperiencePreviewViewModel } from "@/lib/view-models/experience-preview";

type ExperiencePreviewProps = {
  experience: ExperiencePreviewViewModel;
  fallbackIndex?: number;
};

type FeatureItem = {
  key: string;
  icon: LucideIcon;
  label: string;
};

function featureIconForLabel(label: string): LucideIcon {
  const normalized = label.toLowerCase();
  if (normalized.includes("photo")) return Camera;
  if (
    normalized.includes("bbq") ||
    normalized.includes("drink") ||
    normalized.includes("food")
  ) {
    return Flame;
  }
  if (
    normalized.includes("skipper") ||
    normalized.includes("boat") ||
    normalized.includes("host")
  ) {
    return Ship;
  }
  if (
    normalized.includes("fuel") ||
    normalized.includes("sunset") ||
    normalized.includes("coach")
  ) {
    return Sun;
  }
  if (
    normalized.includes("paddle") ||
    normalized.includes("kayak") ||
    normalized.includes("water")
  ) {
    return Waves;
  }
  if (
    normalized.includes("mentor") ||
    normalized.includes("guide") ||
    normalized.includes("personal")
  ) {
    return Anchor;
  }
  return Waves;
}

function resolveLocationLabel(
  experience: ExperiencePreviewViewModel,
  locationMore: (values: { name: string; count: number }) => string
): string | null {
  const primary =
    experience.locations.find((location) => location.isPrimary) ??
    experience.locations[0] ??
    null;

  if (primary) {
    const extraCount = experience.locations.length - 1;
    if (extraCount > 0) {
      return locationMore({ name: primary.name, count: extraCount });
    }
    return primary.name;
  }

  return experience.locationName?.trim() || null;
}

function resolveHostName(
  experience: ExperiencePreviewViewModel
): string | null {
  const teamNames = experience.teamMembers
    .map((member) => member.displayName.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (teamNames.length > 0) {
    return teamNames.join(", ");
  }

  return experience.providerName?.trim() || null;
}

function buildFeatureItems(
  experience: ExperiencePreviewViewModel,
  durationLabel: string,
  capacityLabel: string,
  locationLabel: string | null
): FeatureItem[] {
  const items: FeatureItem[] = [
    { key: "duration", icon: Clock3, label: durationLabel },
    { key: "capacity", icon: Users, label: capacityLabel }
  ];

  if (locationLabel) {
    items.push({
      key: "location",
      icon: MapPin,
      label: locationLabel
    });
  }

  if (experience.availabilitySummary) {
    items.push({
      key: "availability",
      icon: CalendarDays,
      label: experience.availabilitySummary
    });
  }

  const remainingSlots = Math.max(0, 4 - items.length);
  for (const [index, highlight] of takeHighlightFeatures(
    experience.highlights,
    remainingSlots
  ).entries()) {
    items.push({
      key: `highlight-${index}`,
      icon: featureIconForLabel(highlight),
      label: highlight
    });
  }

  return items;
}

export async function ExperiencePreview({
  experience,
  fallbackIndex = 0
}: ExperiencePreviewProps) {
  const t = await getTranslations("HomePage");
  const locale = await getLocale();
  const price = formatPriceLabel(
    experience.startingPriceMinor,
    experience.currency,
    locale
  );
  const href = `/experiences/${experience.slug}`;
  const imageAlt = experience.heroImageAlt?.trim() || experience.title;
  const tone = resolveExperienceCardTone(
    experience.experienceType,
    fallbackIndex
  );
  const durationLabel = formatDurationLabel(experience.durationMinutes, {
    hour: (values) => t("meta.durationHour", values),
    hours: (values) => t("meta.durationHours", values),
    hoursMinutes: (values) => t("meta.durationHoursMinutes", values),
    minutes: (values) => t("meta.durationValue", values)
  });
  const locationLabel = resolveLocationLabel(experience, (values) =>
    t("locationMore", values)
  );
  const features = buildFeatureItems(
    experience,
    durationLabel,
    t("meta.capacityValue", { count: experience.baseCapacity }),
    locationLabel
  );
  const hostName = resolveHostName(experience);
  const hostInitial = hostName?.slice(0, 1).toUpperCase() ?? null;
  const primaryHost = experience.teamMembers[0] ?? null;
  const hostPhotoUrl = getTeamMemberPhotoUrl(primaryHost?.photoPath);
  const showRating =
    experience.reviewCount > 0 &&
    experience.averageRating != null &&
    Number.isFinite(experience.averageRating);
  const priceUnit =
    experience.pricingModel === "per_person"
      ? t("priceUnitPerPerson")
      : experience.pricingModel === "per_group"
        ? t("priceUnitPerGroup")
        : null;

  return (
    <article className={`experience-card tone-${tone}`}>
      <div className={`experience-card-media media-${tone}`}>
        {experience.heroImageUrl ? (
          <ExperiencePreviewImage
            src={experience.heroImageUrl}
            alt={imageAlt}
            focalX={experience.heroFocalX}
            focalY={experience.heroFocalY}
            priority={fallbackIndex < 3}
          />
        ) : null}
        <div className="experience-card-overlay" aria-hidden />
        {experience.categoryLabel ? (
          <span className="experience-category-badge">
            {experience.categoryLabel}
          </span>
        ) : null}
        <FavoriteToggle
          experienceId={experience.id}
          label={t("favoriteLabel")}
          className="experience-favorite-button"
        />
      </div>

      <div className="experience-card-body">
        <div className="experience-card-heading">
          <h3>
            <Link href={href}>{experience.title}</Link>
          </h3>
          {showRating ? (
            <div
              className="experience-review"
              aria-label={t("ratingAriaLabel", {
                rating: experience.averageRating!.toFixed(1),
                count: experience.reviewCount
              })}
            >
              <Star size={15} aria-hidden />
              <strong>{experience.averageRating!.toFixed(1)}</strong>
              <span>
                {t("reviewCountLabel", { count: experience.reviewCount })}
              </span>
            </div>
          ) : null}
        </div>

        {experience.shortDescription ? (
          <p className="experience-card-description">
            {experience.shortDescription}
          </p>
        ) : null}

        {features.length > 0 ? (
          <ul
            className="experience-card-features"
            aria-label={t("featuresLabel")}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.key}>
                  <Icon size={17} aria-hidden />
                  <span>{feature.label}</span>
                </li>
              );
            })}
          </ul>
        ) : null}

        {hostName && hostInitial ? (
          <div className="experience-host-row">
            <ExperienceHostAvatar
              initial={hostInitial}
              photoUrl={hostPhotoUrl}
            />
            <div>
              <strong>{t("hostedBy", { name: hostName })}</strong>
            </div>
          </div>
        ) : null}

        <div className="experience-card-footer flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          {price && priceUnit ? (
            <div className="experience-price">
              <span>{t("fromPrice")}</span>
              <strong>{price}</strong>
              <small>{priceUnit}</small>
            </div>
          ) : (
            <span />
          )}

          <Link href={href} className="experience-card-cta w-full sm:w-auto">
            {t("viewDetails")}
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

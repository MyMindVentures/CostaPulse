import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Anchor,
  ArrowRight,
  Camera,
  Clock3,
  Flame,
  Heart,
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
import { ExperienceCardImage } from "@/features/experiences/components/experience-card-image";
import { getExperienceHeroImageSrc } from "@/lib/media/experience-media";
import type { ExperienceCardViewModel } from "@/server/repositories/catalog";

type ExperienceCardProps = {
  experience: ExperienceCardViewModel;
  fallbackIndex?: number;
};

type FeatureItem = {
  key: string;
  icon: LucideIcon;
  label: string;
};

function formatPrice(experience: ExperienceCardViewModel) {
  if (experience.startingPriceMinor === null || !experience.currency) return null;

  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: experience.currency,
    maximumFractionDigits: 0
  }).format(experience.startingPriceMinor / 100);
}

function formatDurationLabel(
  minutes: number,
  t: Awaited<ReturnType<typeof getTranslations>>
) {
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1
      ? t("meta.durationHour", { hours })
      : t("meta.durationHours", { hours });
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return t("meta.durationHoursMinutes", {
      hours,
      minutes: remainingMinutes
    });
  }

  return t("meta.durationValue", { minutes });
}

function featureIconForLabel(label: string): LucideIcon {
  const normalized = label.toLowerCase();
  if (normalized.includes("photo")) return Camera;
  if (normalized.includes("bbq") || normalized.includes("drink") || normalized.includes("food")) {
    return Flame;
  }
  if (normalized.includes("skipper") || normalized.includes("boat") || normalized.includes("host")) {
    return Ship;
  }
  if (normalized.includes("fuel") || normalized.includes("sunset") || normalized.includes("coach")) {
    return Sun;
  }
  if (normalized.includes("paddle") || normalized.includes("kayak") || normalized.includes("water")) {
    return Waves;
  }
  if (normalized.includes("mentor") || normalized.includes("guide") || normalized.includes("personal")) {
    return Anchor;
  }
  return Waves;
}

function buildFeatureItems(
  experience: ExperienceCardViewModel,
  t: Awaited<ReturnType<typeof getTranslations>>
): FeatureItem[] {
  const items: FeatureItem[] = [
    {
      key: "duration",
      icon: Clock3,
      label: formatDurationLabel(experience.durationMinutes, t)
    },
    {
      key: "capacity",
      icon: Users,
      label: t("meta.capacityValue", { count: experience.baseCapacity })
    }
  ];

  const highlights = takeHighlightFeatures(experience.highlights, 2);
  for (const [index, highlight] of highlights.entries()) {
    items.push({
      key: `highlight-${index}`,
      icon: featureIconForLabel(highlight),
      label: highlight
    });
  }

  if (experience.locationName && items.length < 4) {
    items.push({
      key: "location",
      icon: MapPin,
      label: experience.locationName
    });
  }

  return items;
}

export async function ExperienceCard({
  experience,
  fallbackIndex = 0
}: ExperienceCardProps) {
  const t = await getTranslations("HomePage");
  const price = formatPrice(experience);
  const href = `/experiences/${experience.slug}`;
  const imageSrc = getExperienceHeroImageSrc(experience.heroImagePath);
  const imageAlt = experience.heroImageAlt?.trim() || experience.title;
  // #region agent log
  fetch('http://127.0.0.1:7821/ingest/4a33213c-f005-42e0-867d-a7b2042de466',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'20f0e2'},body:JSON.stringify({sessionId:'20f0e2',runId:'post-fix',hypothesisId:'B',location:'experience-card.tsx:ExperienceCard',message:'card image src resolution',data:{slug:experience.slug,heroImagePath:experience.heroImagePath,imageSrc,hasSupabaseUrl:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),fallbackIndex},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  const tone = resolveExperienceCardTone(experience.experienceType, fallbackIndex);
  const features = buildFeatureItems(experience, t);
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
        {imageSrc ? (
          <ExperienceCardImage
            src={imageSrc}
            alt={imageAlt}
            priority={fallbackIndex < 3}
          />
        ) : null}
        <div className="experience-card-overlay" aria-hidden />
        {experience.categoryLabel ? (
          <span className="experience-category-badge">{experience.categoryLabel}</span>
        ) : null}
        <button
          className="experience-favorite-button"
          type="button"
          aria-label={t("favoriteLabel")}
        >
          <Heart size={18} aria-hidden />
        </button>
      </div>

      <div className="experience-card-body">
        <div className="experience-card-heading">
          <h3>
            <Link href={href}>{experience.title}</Link>
          </h3>
          {showRating ? (
            <div
              className="experience-review"
              aria-label={`Guest rating ${experience.averageRating!.toFixed(1)} from ${experience.reviewCount} reviews`}
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
          <p className="experience-card-description">{experience.shortDescription}</p>
        ) : null}

        {features.length > 0 ? (
          <ul className="experience-card-features" aria-label={t("featuresLabel")}>
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

        {experience.providerName ? (
          <div className="experience-host-row">
            <span className="experience-host-avatar" aria-hidden>
              {experience.providerName.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>{t("hostedBy", { name: experience.providerName })}</strong>
            </div>
          </div>
        ) : null}

        <div className="experience-card-footer">
          {price && priceUnit ? (
            <div className="experience-price">
              <span>{t("fromPrice")}</span>
              <strong>{price}</strong>
              <small>{priceUnit}</small>
            </div>
          ) : (
            <span />
          )}

          <Link href={href} className="experience-card-cta">
            {t("viewDetails")}
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

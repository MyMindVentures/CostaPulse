import Image from "next/image";
import {
  ArrowRight,
  Camera,
  Clock3,
  Flame,
  Ship,
  Star,
  Sun,
  Users,
  Waves
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FavoriteToggle } from "@/features/experiences/favorite-toggle";
import type { ExperienceCardTone } from "@/features/experiences/from-price";

export type ExperienceTileMetaItem = {
  icon: "duration" | "capacity" | "feature";
  label: string;
};

type ExperienceTileProps = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  imageSrc?: string | null;
  imageAlt: string;
  tone?: ExperienceCardTone;
  experienceId?: string;
  categoryLabel?: string | null;
  categoryIcon?: "boat" | "paddle" | "bbq" | "default";
  metaItems?: ExperienceTileMetaItem[];
  fromLabel?: string;
  priceAmount?: string | null;
  priceUnit?: string | null;
  favoriteLabel?: string;
  averageRating?: number | null;
  reviewCount?: number;
  reviewCountLabel?: string | null;
};

const CATEGORY_ICONS: Record<
  NonNullable<ExperienceTileProps["categoryIcon"]>,
  LucideIcon
> = {
  boat: Ship,
  paddle: Waves,
  bbq: Flame,
  default: Waves
};

const META_ICONS: Record<ExperienceTileMetaItem["icon"], LucideIcon> = {
  duration: Clock3,
  capacity: Users,
  feature: Sun
};

function featureIconForLabel(label: string): LucideIcon {
  const normalized = label.toLowerCase();
  if (normalized.includes("photo")) {
    return Camera;
  }
  if (normalized.includes("bbq") || normalized.includes("drink")) {
    return Flame;
  }
  if (normalized.includes("skipper") || normalized.includes("boat")) {
    return Ship;
  }
  if (normalized.includes("fuel") || normalized.includes("sunset")) {
    return Sun;
  }
  return Waves;
}

function formatAverageRating(rating: number): string {
  return rating.toFixed(1);
}

export function ExperienceTile({
  title,
  description,
  href,
  ctaLabel,
  imageSrc,
  imageAlt,
  tone = 1,
  experienceId,
  categoryLabel,
  categoryIcon = "default",
  metaItems = [],
  fromLabel,
  priceAmount,
  priceUnit,
  favoriteLabel,
  averageRating = null,
  reviewCount = 0,
  reviewCountLabel = null
}: ExperienceTileProps) {
  const CategoryIcon = CATEGORY_ICONS[categoryIcon];
  const showPrice = Boolean(priceAmount);
  const showFavorite = Boolean(experienceId && favoriteLabel);
  const showRating =
    reviewCount > 0 &&
    averageRating != null &&
    Number.isFinite(averageRating) &&
    Boolean(reviewCountLabel);

  return (
    <article className={`experience-tile tone-${tone}`}>
      <div className="experience-tile-media">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 960px) 100vw, 33vw"
            className="experience-tile-image"
          />
        ) : (
          <span className="experience-tile-fallback" aria-hidden />
        )}

        {categoryLabel ? (
          <span className="experience-tile-badge">
            <CategoryIcon size={14} aria-hidden />
            {categoryLabel}
          </span>
        ) : null}

        {showFavorite ? (
          <FavoriteToggle experienceId={experienceId!} label={favoriteLabel!} />
        ) : null}
      </div>

      <div className="experience-tile-body">
        <div className="experience-tile-heading">
          <h3>
            <a href={href}>{title}</a>
          </h3>
          {showRating ? (
            <p className="experience-tile-rating">
              <Star size={14} aria-hidden />
              <span className="experience-tile-rating-value">
                {formatAverageRating(averageRating)}
              </span>
              <span className="experience-tile-rating-count">
                {reviewCountLabel}
              </span>
            </p>
          ) : null}
        </div>
        <p>{description}</p>

        {metaItems.length > 0 ? (
          <ul className="experience-tile-meta">
            {metaItems.map((item) => {
              const Icon =
                item.icon === "feature"
                  ? featureIconForLabel(item.label)
                  : META_ICONS[item.icon];
              return (
                <li key={`${item.icon}-${item.label}`}>
                  <Icon size={16} aria-hidden />
                  <span>{item.label}</span>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="experience-tile-footer">
          {showPrice ? (
            <div className="experience-tile-price">
              {fromLabel ? <span>{fromLabel}</span> : null}
              <strong>{priceAmount}</strong>
              {priceUnit ? <em>{priceUnit}</em> : null}
            </div>
          ) : (
            <span />
          )}
          <a href={href} className="experience-tile-cta">
            {ctaLabel}
            <ArrowRight size={16} aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}

export function categoryIconForExperienceType(
  experienceType: string | null | undefined
): NonNullable<ExperienceTileProps["categoryIcon"]> {
  switch (experienceType) {
    case "boat_experience":
      return "boat";
    case "bbq_experience":
      return "bbq";
    case "paddlesurf_mentor":
    case "kayak_mentor":
      return "paddle";
    default:
      return "default";
  }
}

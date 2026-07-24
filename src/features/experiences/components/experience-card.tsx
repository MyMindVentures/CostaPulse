import Image from "next/image";
import Link from "next/link";
import {
  Anchor,
  ArrowRight,
  Clock3,
  Heart,
  MapPin,
  ShieldCheck,
  Star,
  Users
} from "lucide-react";
import { getExperienceHeroImageSrc } from "@/lib/media/experience-media";
import type { ExperienceCardViewModel } from "@/server/repositories/catalog";

type ExperienceCardProps = {
  experience: ExperienceCardViewModel;
  fallbackIndex?: number;
};

function formatPrice(experience: ExperienceCardViewModel) {
  if (experience.startingPriceMinor === null || !experience.currency) return null;

  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: experience.currency,
    maximumFractionDigits: 0
  }).format(experience.startingPriceMinor / 100);
}

function formatDuration(minutes: number) {
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes} minutes`;
}

export function ExperienceCard({ experience, fallbackIndex = 0 }: ExperienceCardProps) {
  const price = formatPrice(experience);
  const category = experience.categoryLabel ?? "Costa Blanca experience";
  const href = `/experiences/${experience.slug}`;
  const imageSrc = getExperienceHeroImageSrc(experience.heroImagePath);

  return (
    <article className="experience-card">
      <div className={`experience-card-media media-${(fallbackIndex % 3) + 1}`}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={experience.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
            className="experience-card-image"
          />
        ) : null}
        <div className="experience-card-overlay" aria-hidden />
        <span className="experience-category-badge">{category}</span>
        <button className="experience-favorite-button" type="button" aria-label={`Save ${experience.title}`}>
          <Heart size={18} aria-hidden />
        </button>
      </div>

      <div className="experience-card-body">
        <div className="experience-card-heading">
          <h3>
            <Link href={href}>{experience.title}</Link>
          </h3>
          <div className="experience-review" aria-label="Guest rating 5 out of 5">
            <Star size={15} aria-hidden />
            <strong>5.0</strong>
            <span>Guest favourite</span>
          </div>
        </div>

        <p className="experience-card-description">
          {experience.shortDescription ??
            "Discover the Costa Blanca through a personally hosted experience built around your group."}
        </p>

        <ul className="experience-card-features" aria-label="Experience highlights">
          <li>
            <Clock3 size={17} aria-hidden />
            <span>{formatDuration(experience.durationMinutes)}</span>
          </li>
          <li>
            <Users size={17} aria-hidden />
            <span>Up to {experience.baseCapacity} guests</span>
          </li>
          <li>
            <Anchor size={17} aria-hidden />
            <span>Personally hosted</span>
          </li>
          <li>
            <MapPin size={17} aria-hidden />
            <span>{experience.locationName ?? "Costa Blanca"}</span>
          </li>
        </ul>

        {experience.providerName ? (
          <div className="experience-host-row">
            <span className="experience-host-avatar" aria-hidden>
              {experience.providerName.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>Hosted by {experience.providerName}</strong>
              <span>
                <ShieldCheck size={14} aria-hidden />
                Local expert and trusted host
              </span>
            </div>
          </div>
        ) : null}

        <div className="experience-card-footer">
          {price ? (
            <div className="experience-price">
              <span>From</span>
              <strong>{price}</strong>
              <small>{experience.pricingModel === "per_person" ? "per person" : "per private group"}</small>
            </div>
          ) : (
            <div className="experience-price experience-price-muted">
              <span>Tailored</span>
              <strong>On request</strong>
              <small>Built around your group</small>
            </div>
          )}

          <Link href={href} className="experience-card-cta">
            View experience
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

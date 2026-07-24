import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, MapPin, Star, Users } from "lucide-react";
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

export function ExperienceCard({ experience, fallbackIndex = 0 }: ExperienceCardProps) {
  const price = formatPrice(experience);

  return (
    <article className="experience-card">
      <div className={`experience-card-media media-${(fallbackIndex % 3) + 1}`}>
        {experience.heroImagePath ? (
          <Image
            src={experience.heroImagePath}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
            className="experience-card-image"
          />
        ) : null}
        <span>{experience.categoryLabel ?? "Costa Blanca experience"}</span>
      </div>

      <div className="experience-card-body">
        <div className="experience-card-heading">
          <h3>
            <Link href={`/experiences/${experience.slug}`}>{experience.title}</Link>
          </h3>
          {experience.providerName ? (
            <span>
              <Star size={16} aria-hidden />
              {experience.providerName}
            </span>
          ) : null}
        </div>

        <p>{experience.shortDescription ?? "A personally hosted Costa Blanca experience."}</p>

        <dl className="experience-meta">
          <div>
            <dt>Duration</dt>
            <dd>
              <Clock3 size={16} aria-hidden />
              {Math.round(experience.durationMinutes / 60)} hours
            </dd>
          </div>
          <div>
            <dt>Guests</dt>
            <dd>
              <Users size={16} aria-hidden />
              Up to {experience.baseCapacity}
            </dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>
              <MapPin size={16} aria-hidden />
              {experience.locationName ?? "Costa Blanca"}
            </dd>
          </div>
        </dl>

        <div className="experience-card-footer">
          {price ? (
            <div className="experience-price">
              <span>From</span>
              <strong>{price}</strong>
              <small>{experience.pricingModel === "per_person" ? "per person" : "per group"}</small>
            </div>
          ) : <span />}

          <Link href={`/experiences/${experience.slug}`} className="card-link">
            View details
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

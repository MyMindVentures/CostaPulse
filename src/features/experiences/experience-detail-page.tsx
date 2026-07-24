import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clock3, MapPin, ShieldCheck, Users } from "lucide-react";
import { BrandLink } from "@/components/shared/brand-link";
import { Container } from "@/components/ui/container";
import type { ExperienceDetailViewModel } from "@/server/repositories/catalog";

type ExperienceDetailPageProps = {
  experience: ExperienceDetailViewModel;
};

function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amountMinor / 100);
}

export function ExperienceDetailPageFeature({ experience }: ExperienceDetailPageProps) {
  const startingPrice = experience.startingPriceMinor !== null && experience.currency
    ? formatMoney(experience.startingPriceMinor, experience.currency)
    : null;

  return (
    <main className="experience-detail-page">
      <header className="detail-header">
        <Container className="catalog-nav">
          <BrandLink href="/" />
          <Link href="/experiences" className="button button-outline">
            <ArrowLeft size={18} aria-hidden />
            All experiences
          </Link>
        </Container>
      </header>

      <section className="detail-hero">
        {experience.heroImagePath ? (
          <Image src={experience.heroImagePath} alt="" fill priority className="detail-hero-image" sizes="100vw" />
        ) : <div className="detail-hero-fallback" aria-hidden />}
        <div className="detail-hero-overlay" aria-hidden />
        <Container className="detail-hero-content">
          <p className="eyebrow"><span />{experience.categoryLabel ?? "Costa Blanca experience"}</p>
          <h1>{experience.title}</h1>
          <p>{experience.shortDescription ?? "A personally hosted day on and around the Costa Blanca."}</p>
          <div className="detail-meta-row">
            <span><Clock3 size={18} aria-hidden />{Math.round(experience.durationMinutes / 60)} hours</span>
            <span><Users size={18} aria-hidden />Up to {experience.baseCapacity} guests</span>
            <span><MapPin size={18} aria-hidden />{experience.locationName ?? "Costa Blanca"}</span>
          </div>
          <div className="detail-actions">
            <a href="#availability" className="button button-coral">Check availability <ArrowRight size={18} aria-hidden /></a>
            <a href="mailto:hello@costapulse.club" className="button button-outline">Contact us</a>
          </div>
        </Container>
      </section>

      <section className="detail-content">
        <Container className="detail-grid">
          <article className="detail-story">
            <p className="section-kicker">Your day, your way</p>
            <h2>About this experience</h2>
            <p>{experience.description ?? experience.shortDescription ?? "We tailor the day around your group, the weather and the best local conditions."}</p>

            <div className="detail-inclusions">
              <h3>What you can expect</h3>
              {["Personal hosting and local knowledge", "Small-group attention", "Clear meeting instructions", "Safety-first preparation"].map((item) => (
                <span key={item}><Check size={18} aria-hidden />{item}</span>
              ))}
            </div>
          </article>

          <aside className="host-card">
            <ShieldCheck size={34} aria-hidden />
            <span>Your host</span>
            <h2>{experience.providerName ?? "CostaPulse local host"}</h2>
            <p>Personally hosted with local knowledge, professional preparation and attention for your group.</p>
          </aside>
        </Container>
      </section>

      <section className="variant-section">
        <Container>
          <div className="catalog-heading">
            <div>
              <p className="section-kicker">Choose your format</p>
              <h2>Available options</h2>
            </div>
            <p>Select the experience format that best fits your group.</p>
          </div>

          {experience.variants.length > 0 ? (
            <div className="variant-grid">
              {experience.variants.map((variant) => (
                <article key={variant.id} className="variant-card">
                  <h3>{variant.name}</h3>
                  <p>{variant.description ?? "A flexible option for your Costa Blanca experience."}</p>
                  <strong>{formatMoney(variant.unitAmountMinor, variant.currency)}</strong>
                  <span>{variant.pricingModel === "per_person" ? "per person" : "per group"}</span>
                  <small>{variant.minPartySize}{variant.maxPartySize ? `–${variant.maxPartySize}` : "+"} guests</small>
                </article>
              ))}
            </div>
          ) : (
            <p className="catalog-empty">Contact us for current options and pricing.</p>
          )}
        </Container>
      </section>

      <section className="detail-booking" id="availability">
        <Container className="detail-booking-inner">
          <div>
            <p className="section-kicker light">Ready to plan your day?</p>
            <h2>{startingPrice ? `From ${startingPrice}` : "Request availability"}</h2>
            <p>Tell us your preferred date and group size. We will confirm the best available option.</p>
          </div>
          <a href={`mailto:hello@costapulse.club?subject=${encodeURIComponent(`Availability: ${experience.title}`)}`} className="button button-coral">
            Check availability
            <ArrowRight size={18} aria-hidden />
          </a>
        </Container>
      </section>
    </main>
  );
}

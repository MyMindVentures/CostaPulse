import {
  ArrowRight,
  Clock3,
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BrandLink } from "@/components/shared/brand-link";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Container } from "@/components/ui/container";
import { getPublishedExperienceCards } from "@/server/repositories/catalog";
import { getSiteLogoAsset } from "@/server/repositories/media-assets";
import { ExperienceSection } from "./experience-section";

type CuratedCategory = {
  number: string;
  title: string;
  copy: string;
};

type TrustPoint = {
  title: string;
  description: string;
};

type HeroTrustPoint = {
  title: string;
  label: string;
};

type LocationPill = {
  label: string;
};

export async function HomePageFeature() {
  const t = await getTranslations("HomePage");
  const curatedCategories = t.raw("curatedCategories") as CuratedCategory[];
  const heroTrustPoints = t.raw("heroTrustPoints") as HeroTrustPoint[];
  const locationPills = t.raw("locationPills") as LocationPill[];
  const trustPoints = t.raw("trustPoints") as TrustPoint[];
  const experiences = await getPublishedExperienceCards(3);
  const siteLogo = await getSiteLogoAsset();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CostaPulse",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.costapulse.club",
    description: "Curated Costa Blanca experiences"
  };

  return (
    <main className="home-page overflow-x-clip">
      <section className="hero" id="top">
        <div className="hero-seascape" aria-hidden />
        <Container className="hero-shell">
          <div className="hero-grid grid grid-cols-1 items-end gap-12 py-[clamp(4rem,9vw,8rem)_2rem] lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)]">
            <div className="hero-copy min-w-0">
              <p className="eyebrow">
                <span />
                {t("eyebrow")}
              </p>
              <h1 className="mt-5 max-w-[12ch] text-[clamp(2.75rem,12vw,4.5rem)] leading-[0.92] sm:text-[clamp(3.4rem,8.7vw,5.5rem)] lg:text-[clamp(4.2rem,8.7vw,7.4rem)]">
                {t("title")}
              </h1>
              <p className="hero-description">{t("description")}</p>
              <div className="hero-actions mt-8 flex flex-wrap gap-3">
                <a href="#experiences" className="button button-coral">
                  {t("browse")}
                  <ArrowRight size={18} aria-hidden />
                </a>
                <a href="#cta" className="button button-outline">
                  {t("privateDayCta")}
                  <ArrowRight size={18} aria-hidden />
                </a>
              </div>
            </div>

            <div
              className="hero-feature-panel min-h-40 self-stretch lg:min-h-96"
              aria-hidden
            >
              <div className="hero-card">
                <span>{t("heroCardKicker")}</span>
                <strong>{t("heroCardTitle")}</strong>
              </div>
            </div>
          </div>

          <div
            className="hero-trust-grid mt-4 grid max-w-[46rem] grid-cols-2 sm:grid-cols-4"
            aria-label={t("heroTrustLabel")}
          >
            {heroTrustPoints.map((item, index) => (
              <article key={item.title}>
                {index === 0 ? (
                  <ShieldCheck aria-hidden />
                ) : index === 1 ? (
                  <Users aria-hidden />
                ) : index === 2 ? (
                  <Sparkles aria-hidden />
                ) : (
                  <Compass aria-hidden />
                )}
                <strong>{item.title}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>

          <div
            className="location-pill-bar mt-8 inline-flex max-w-full flex-wrap items-center gap-3.5"
            id="locations"
          >
            <MapPin size={16} aria-hidden />
            {locationPills.map((item) => (
              <span key={item.label}>{item.label}</span>
            ))}
          </div>
        </Container>
      </section>

      <section className="intro" id="intro">
        <Container className="intro-grid grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(10rem,0.9fr)_minmax(0,2.4fr)_auto]">
          <SectionKicker>{t("introKicker")}</SectionKicker>
          <div className="intro-copy min-w-0">
            <h2>{t("introTitle")}</h2>
            <p>{t("introDescription")}</p>
          </div>
        </Container>
      </section>

      <ExperienceSection
        experiences={experiences}
        curatedCategories={curatedCategories}
        kicker={t("experiencesKicker")}
        title={t("experiencesTitle")}
        description={t("experiencesDescription")}
        viewAllLabel={t("viewAllExperiences")}
        viewMapLabel={t("viewOnMap")}
        fallbackBadge={t("experienceBadge")}
        viewDetailsLabel={t("viewDetails")}
      />

      <section className="trust" id="trust">
        <Container className="trust-grid my-[clamp(4rem,8vw,6rem)] grid grid-cols-1 gap-4 sm:grid-cols-2">
          {trustPoints.map((item, index) => (
            <article key={item.title}>
              {index === 0 ? (
                <ShieldCheck aria-hidden />
              ) : (
                <Sparkles aria-hidden />
              )}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </Container>
      </section>

      <section className="readiness-strip" aria-label={t("readinessTitle")}>
        <Container className="readiness-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="border-border flex items-start gap-4 border-t pt-5">
            <Clock3 aria-hidden />
            <div className="min-w-0">
              <strong>{t("readinessCards.backend.title")}</strong>
              <p>{t("readinessCards.backend.description")}</p>
            </div>
          </article>
          <article className="border-border flex items-start gap-4 border-t pt-5">
            <Users aria-hidden />
            <div className="min-w-0">
              <strong>{t("readinessCards.operations.title")}</strong>
              <p>{t("readinessCards.operations.description")}</p>
            </div>
          </article>
          <article className="border-border flex items-start gap-4 border-t pt-5">
            <Compass aria-hidden />
            <div className="min-w-0">
              <strong>{t("readinessCards.inventory.title")}</strong>
              <p>{t("readinessCards.inventory.description")}</p>
            </div>
          </article>
        </Container>
      </section>

      <section className="cta" id="cta">
        <Container>
          <SectionKicker>{t("ctaKicker")}</SectionKicker>
          <h2>{t("ctaTitle")}</h2>
          <a
            href="mailto:hello@costapulse.club"
            className="inline-link cta-link"
          >
            {t("ctaLink")}
            <ArrowRight size={18} aria-hidden />
          </a>
        </Container>
      </section>

      <footer className="footer">
        <Container className="footer-grid grid grid-cols-1 items-center gap-4 text-center sm:grid-cols-3 sm:text-start">
          <BrandLink
            href="#top"
            logoSrc={siteLogo.url}
            logoAlt={siteLogo.alt}
          />
          <p>{t("footerTagline")}</p>
          <p>{t("footerCopyright", { year: new Date().getFullYear() })}</p>
        </Container>
      </footer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c")
        }}
      />
    </main>
  );
}

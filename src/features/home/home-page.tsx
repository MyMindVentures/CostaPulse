import {
  ArrowRight,
  Clock3,
  Compass,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BrandLink } from "@/components/shared/brand-link";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Container } from "@/components/ui/container";
import { getPublishedExperienceCards } from "@/server/repositories/catalog";
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

type NavItem = {
  label: string;
  href: string;
};

export async function HomePageFeature() {
  const t = await getTranslations("HomePage");
  const navItems = t.raw("nav") as NavItem[];
  const curatedCategories = t.raw("curatedCategories") as CuratedCategory[];
  const heroTrustPoints = t.raw("heroTrustPoints") as HeroTrustPoint[];
  const locationPills = t.raw("locationPills") as LocationPill[];
  const trustPoints = t.raw("trustPoints") as TrustPoint[];
  const experiences = await getPublishedExperienceCards(3);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CostaPulse",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.costapulse.club",
    description: "Curated Costa Blanca experiences"
  };

  return (
    <main className="home-page">
      <section className="hero" id="top">
        <div className="hero-seascape" aria-hidden />
        <Container className="hero-shell">
          <nav className="hero-nav" aria-label="Primary navigation">
            <BrandLink href="#top" />
            <div className="hero-nav-links">
              {navItems.map((item) => (
                <a href={item.href} key={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
            <div className="hero-nav-actions">
              <a href="#experiences" className="button button-coral">
                {t("bookCta")}
              </a>
              <span className="menu-button" aria-hidden>
                <Menu size={22} aria-hidden />
              </span>
            </div>
          </nav>

          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">
                <span />
                {t("eyebrow")}
              </p>
              <h1>{t("title")}</h1>
              <p className="hero-description">{t("description")}</p>
              <div className="hero-actions">
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

            <div className="hero-feature-panel" aria-hidden>
              <div className="hero-card">
                <span>{t("heroCardKicker")}</span>
                <strong>{t("heroCardTitle")}</strong>
              </div>
            </div>
          </div>

          <div className="hero-trust-grid" aria-label={t("heroTrustLabel")}>
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

          <div className="location-pill-bar" id="locations">
            <MapPin size={16} aria-hidden />
            {locationPills.map((item) => (
              <span key={item.label}>{item.label}</span>
            ))}
          </div>
        </Container>
      </section>

      <section className="intro" id="intro">
        <Container className="intro-grid">
          <SectionKicker>{t("introKicker")}</SectionKicker>
          <div className="intro-copy">
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
        fallbackBadge={t("experienceBadge")}
        viewDetailsLabel={t("viewDetails")}
      />

      <section className="trust" id="trust">
        <Container className="trust-grid">
          {trustPoints.map((item, index) => (
            <article key={item.title}>
              {index === 0 ? <ShieldCheck aria-hidden /> : <Sparkles aria-hidden />}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </Container>
      </section>

      <section className="readiness-strip" aria-label={t("readinessTitle")}>
        <Container className="readiness-grid">
          <article>
            <Clock3 aria-hidden />
            <div>
              <strong>{t("readinessCards.backend.title")}</strong>
              <p>{t("readinessCards.backend.description")}</p>
            </div>
          </article>
          <article>
            <Users aria-hidden />
            <div>
              <strong>{t("readinessCards.operations.title")}</strong>
              <p>{t("readinessCards.operations.description")}</p>
            </div>
          </article>
          <article>
            <Compass aria-hidden />
            <div>
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
          <a href="mailto:hello@costapulse.club" className="inline-link cta-link">
            {t("ctaLink")}
            <ArrowRight size={18} aria-hidden />
          </a>
        </Container>
      </section>

      <footer className="footer">
        <Container className="footer-grid">
          <BrandLink href="#top" />
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

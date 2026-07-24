import {
  ArrowDownRight,
  ArrowRight,
  Clock3,
  Compass,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { BrandLink } from "@/components/shared/brand-link";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Container } from "@/components/ui/container";
import { getPublishedExperienceHighlights } from "@/server/repositories/catalog";

type CuratedCategory = {
  number: string;
  title: string;
  copy: string;
};

type TrustPoint = {
  title: string;
  description: string;
};

export async function HomePageFeature() {
  const t = await getTranslations("HomePage");
  const curatedCategories = t.raw("curatedCategories") as CuratedCategory[];
  const trustPoints = t.raw("trustPoints") as TrustPoint[];
  const experiences = await getPublishedExperienceHighlights(3);
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
        <Container>
          <nav className="hero-nav" aria-label="Primary navigation">
            <BrandLink href="#top" />
            <a href="#experiences" className="inline-link">
              {t("browse")}
              <ArrowDownRight size={16} aria-hidden />
            </a>
          </nav>
        </Container>

        <div className="hero-orb" aria-hidden />
        <Container className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span />
              {t("eyebrow")}
            </p>
            <h1>{t("title")}</h1>
            <div className="hero-bottom">
              <p>{t("description")}</p>
              <a
                href="#experiences"
                className="circle-button"
                aria-label={t("browse")}
              >
                <ArrowDownRight aria-hidden />
              </a>
            </div>
          </div>

          <div className="hero-art" aria-hidden>
            <Image
              src="/illustrations/hero-horizon.svg"
              alt=""
              width={480}
              height={480}
              priority
            />
          </div>
        </Container>
      </section>

      <section className="intro">
        <Container className="intro-grid">
          <SectionKicker>{t("introKicker")}</SectionKicker>
          <div className="intro-copy">
            <h2>{t("introTitle")}</h2>
            <p>{t("introDescription")}</p>
          </div>
        </Container>
      </section>

      <section
        className="experiences"
        id="experiences"
        aria-labelledby="experiences-title"
      >
        <Container>
          <div className="section-heading">
            <SectionKicker light>{t("experiencesKicker")}</SectionKicker>
            <h2 id="experiences-title">{t("experiencesTitle")}</h2>
          </div>

          {experiences.length > 0 ? (
            <div className="experience-list">
              {experiences.map((experience) => (
                <article key={experience.id}>
                  <div>
                    <h3>{experience.title}</h3>
                    <p>
                      {experience.shortDescription ?? t("experienceFallback")}
                    </p>
                  </div>
                  <dl className="experience-meta">
                    <div>
                      <dt>{t("meta.duration")}</dt>
                      <dd>
                        {t("meta.durationValue", {
                          minutes: experience.durationMinutes
                        })}
                      </dd>
                    </div>
                    <div>
                      <dt>{t("meta.capacity")}</dt>
                      <dd>
                        {t("meta.capacityValue", {
                          count: experience.baseCapacity
                        })}
                      </dd>
                    </div>
                    <div>
                      <dt>{t("meta.location")}</dt>
                      <dd>
                        {experience.locationName ?? t("meta.locationPending")}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <div className="curated-grid">
              {curatedCategories.map((item) => (
                <article key={item.number} className="curated-card">
                  <span>{item.number}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </div>
                  <Compass aria-hidden />
                </article>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="trust">
        <Container className="trust-grid">
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

      <section className="cta">
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

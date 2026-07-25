import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/shared/empty-state";
import { getPublishedExperienceCards } from "@/server/repositories/catalog";
import { ExperienceCard } from "./components/experience-card";

export async function ExperiencesPageFeature() {
  const [t, locale] = await Promise.all([
    getTranslations("ExperiencesPage"),
    getLocale()
  ]);
  const experiences = await getPublishedExperienceCards(undefined, locale);

  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <Container className="catalog-hero">
          <p className="eyebrow">
            <span />
            {t("eyebrow")}
          </p>
          <h1>{t("heroTitle")}</h1>
          <p>{t("heroDescription")}</p>
        </Container>
      </header>

      <section className="catalog-content" aria-labelledby="catalog-title">
        <Container>
          <div className="catalog-heading grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <p className="section-kicker">{t("sectionKicker")}</p>
              <h2 id="catalog-title">{t("sectionTitle")}</h2>
            </div>
            <div className="catalog-heading__aside grid gap-4">
              <p>{t("sectionDescription")}</p>
              <Link href="/experiences/map" className="button button-outline">
                {t("exploreMapCta")}
              </Link>
            </div>
          </div>

          {experiences.length > 0 ? (
            <div className="experience-catalog-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {experiences.map((experience, index) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  fallbackIndex={index}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              className="catalog-empty"
              title={t("emptyTitle")}
              description={t("emptyDescription")}
              actionLabel={t("emptyCta")}
              actionHref={t("emptyMailto")}
            />
          )}
        </Container>
      </section>
    </main>
  );
}

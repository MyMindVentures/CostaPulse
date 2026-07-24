import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/shared/empty-state";
import { getPublishedExperienceCards } from "@/server/repositories/catalog";
import { ExperienceCard } from "./components/experience-card";

export async function ExperiencesPageFeature() {
  const t = await getTranslations("ExperiencesPage");
  const experiences = await getPublishedExperienceCards();

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
          <div className="catalog-heading">
            <div>
              <p className="section-kicker">{t("sectionKicker")}</p>
              <h2 id="catalog-title">{t("sectionTitle")}</h2>
            </div>
            <div className="catalog-heading__aside">
              <p>{t("sectionDescription")}</p>
              <Link href="/experiences/map" className="button button-outline">
                {t("exploreMapCta")}
              </Link>
            </div>
          </div>

          {experiences.length > 0 ? (
            <div className="experience-catalog-grid">
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

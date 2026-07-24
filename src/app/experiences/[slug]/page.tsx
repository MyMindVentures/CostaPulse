import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { getPublishedExperienceCards } from "@/server/repositories/catalog";

type ExperienceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ExperienceDetailPage({
  params
}: ExperienceDetailPageProps) {
  const { slug } = await params;
  const t = await getTranslations("HomePage");
  const cards = await getPublishedExperienceCards(50);
  const experience = cards.find((card) => card.slug === slug);

  if (!experience) {
    notFound();
  }

  return (
    <main className="home-page">
      <section className="intro">
        <Container className="intro-grid">
          <Link href="/" className="inline-link">
            CostaPulse
          </Link>
          <div className="intro-copy">
            <h1>{experience.title}</h1>
            <p>{experience.shortDescription ?? t("experienceFallback")}</p>
            <Link href="/#experiences" className="inline-link cta-link">
              {t("viewAllExperiences")}
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}

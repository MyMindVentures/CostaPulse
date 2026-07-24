import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BrandLink } from "@/components/shared/brand-link";
import { Container } from "@/components/ui/container";
import { getPublishedExperienceCards } from "@/server/repositories/catalog";
import { getSiteLogoAsset } from "@/server/repositories/media-assets";
import { ExperienceCard } from "./components/experience-card";

export async function ExperiencesPageFeature() {
  const [experiences, siteLogo] = await Promise.all([
    getPublishedExperienceCards(),
    getSiteLogoAsset()
  ]);

  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <Container className="catalog-nav">
          <BrandLink href="/" logoSrc={siteLogo.url} logoAlt={siteLogo.alt} />
          <Link href="/" className="button button-outline">
            <ArrowLeft size={18} aria-hidden />
            Back home
          </Link>
        </Container>
        <Container className="catalog-hero">
          <p className="eyebrow"><span />Costa Blanca experiences</p>
          <h1>Choose your perfect day.</h1>
          <p>Private yacht trips, paddle adventures and personally hosted moments along the Mediterranean coast.</p>
        </Container>
      </header>

      <section className="catalog-content" aria-labelledby="catalog-title">
        <Container>
          <div className="catalog-heading">
            <div>
              <p className="section-kicker">Explore the coast</p>
              <h2 id="catalog-title">All experiences</h2>
            </div>
            <p>Every experience is hosted in small groups with personal attention, local knowledge and clear pricing.</p>
          </div>

          {experiences.length > 0 ? (
            <div className="experience-catalog-grid">
              {experiences.map((experience, index) => (
                <ExperienceCard key={experience.id} experience={experience} fallbackIndex={index} />
              ))}
            </div>
          ) : (
            <div className="catalog-empty">
              <h2>New experiences are coming soon.</h2>
              <p>Contact us and we will create a private Costa Blanca day around your group.</p>
              <a href="mailto:hello@costapulse.club" className="button button-coral">
                Plan a private day
                <ArrowRight size={18} aria-hidden />
              </a>
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}

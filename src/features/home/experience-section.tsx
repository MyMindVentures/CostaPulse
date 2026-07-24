import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Container } from "@/components/ui/container";
import type { ExperienceCardViewModel } from "@/server/repositories/catalog";
import { ExperienceCard } from "@/features/experiences/components/experience-card";

type CuratedCategory = {
  number: string;
  title: string;
  copy: string;
};

type ExperienceSectionProps = {
  experiences: ExperienceCardViewModel[];
  curatedCategories: CuratedCategory[];
  kicker: string;
  title: string;
  description: string;
  viewAllLabel: string;
  fallbackBadge: string;
  viewDetailsLabel: string;
};

export function ExperienceSection({
  experiences,
  curatedCategories,
  kicker,
  title,
  description,
  viewAllLabel,
  viewDetailsLabel
}: ExperienceSectionProps) {
  return (
    <section className="experiences" id="experiences" aria-labelledby="experiences-title">
      <Container>
        <div className="section-heading">
          <SectionKicker light>{kicker}</SectionKicker>
          <div>
            <h2 id="experiences-title">{title}</h2>
            <p>{description}</p>
          </div>
          <Link href="/experiences" className="button button-light">
            {viewAllLabel}
            <ArrowRight size={18} aria-hidden />
          </Link>
        </div>

        {experiences.length > 0 ? (
          <div className="experience-list">
            {experiences.map((experience, index) => (
              <ExperienceCard key={experience.id} experience={experience} fallbackIndex={index} />
            ))}
          </div>
        ) : (
          <div className="curated-grid">
            {curatedCategories.map((item) => (
              <article key={item.number} className="curated-card">
                <div className="curated-card-media" aria-hidden>
                  <span>{item.number}</span>
                </div>
                <div className="curated-card-body">
                  <span>{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                  <Link href="/experiences" className="card-link">
                    {viewDetailsLabel}
                    <ArrowRight size={16} aria-hidden />
                  </Link>
                </div>
                <Compass aria-hidden />
              </article>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

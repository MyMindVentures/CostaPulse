import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Container } from "@/components/ui/container";
import type { ExperiencePreviewViewModel } from "@/lib/view-models/experience-preview";
import { ExperiencePreview } from "@/features/experiences/preview/experience-preview";

type CuratedCategory = {
  number: string;
  title: string;
  copy: string;
};

type ExperienceSectionProps = {
  experiences: ExperiencePreviewViewModel[];
  curatedCategories: CuratedCategory[];
  kicker: string;
  title: string;
  description: string;
  viewAllLabel: string;
  viewMapLabel: string;
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
  viewMapLabel,
  viewDetailsLabel
}: ExperienceSectionProps) {
  return (
    <section
      className="experiences"
      id="experiences"
      aria-labelledby="experiences-title"
    >
      <Container>
        <div className="section-heading mb-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(10rem,0.9fr)_minmax(0,2.4fr)_auto]">
          <SectionKicker light>{kicker}</SectionKicker>
          <div className="min-w-0">
            <h2 id="experiences-title">{title}</h2>
            <p>{description}</p>
          </div>
          <div className="section-heading__actions flex flex-wrap items-center gap-3">
            <Link href="/experiences/map" className="button button-outline">
              {viewMapLabel}
            </Link>
            <Link href="/experiences" className="button button-light">
              {viewAllLabel}
              <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </div>

        {experiences.length > 0 ? (
          <div className="experience-list grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((experience, index) => (
              <ExperiencePreview
                key={experience.id}
                experience={experience}
                fallbackIndex={index}
              />
            ))}
          </div>
        ) : (
          <div className="curated-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {curatedCategories.map((item) => (
              <article key={item.number} className="curated-card">
                <div className="curated-card-media" aria-hidden>
                  <span>{item.number}</span>
                </div>
                <div className="curated-card-body min-w-0">
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

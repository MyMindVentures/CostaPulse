import { Container } from "@/components/ui/container";
import type { ExperienceDetailViewModel } from "@/server/repositories/catalog";
import { BookingWidget } from "./booking-widget";
import { DetailBreadcrumbs } from "./detail-breadcrumbs";
import { DetailHero } from "./detail-hero";
import { DetailHighlightsBar } from "./detail-highlights-bar";
import { DetailTabs } from "./detail-tabs";
import { MapPreview } from "./map-preview";
import { MeetingPointsCard } from "./meeting-points-card";

type ExperienceDetailProps = {
  experience: ExperienceDetailViewModel;
};

export async function ExperienceDetail({
  experience
}: ExperienceDetailProps) {
  return (
    <main className="xp-detail-page">
      <Container className="xp-detail-top">
        <DetailBreadcrumbs title={experience.title} />
      </Container>

      <DetailHero experience={experience} />
      <DetailHighlightsBar highlights={experience.highlights} />

      <section className="xp-detail-body">
        <Container className="xp-detail-layout">
          <div className="xp-detail-main">
            <DetailTabs experience={experience} />
          </div>

          <aside className="xp-detail-sidebar">
            <BookingWidget
              experienceSlug={experience.slug}
              experienceId={experience.id}
              timezone={experience.timezone}
              variants={experience.variants}
              pricingModel={experience.pricingModel}
              startingPriceMinor={experience.startingPriceMinor}
              currency={experience.currency}
              averageRating={experience.reviews.averageRating}
              reviewCount={experience.reviews.reviewCount}
              policies={experience.policies}
            />
            <MeetingPointsCard locations={experience.locations} />
            <MapPreview
              locations={experience.locations}
              title={experience.title}
            />
          </aside>
        </Container>
      </section>
    </main>
  );
}

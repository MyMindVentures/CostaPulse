import { Container } from "@/components/ui/container";
import type { ExperienceDetailViewModel } from "@/server/repositories/catalog";
import { BookingWidget } from "./detail/booking-widget";
import { DetailBreadcrumbs } from "./detail/detail-breadcrumbs";
import { DetailHero } from "./detail/detail-hero";
import { DetailHighlightsBar } from "./detail/detail-highlights-bar";
import { DetailTabs } from "./detail/detail-tabs";
import { MapPreview } from "./detail/map-preview";
import { MeetingPointsCard } from "./detail/meeting-points-card";

type ExperienceDetailPageProps = {
  experience: ExperienceDetailViewModel;
};

export async function ExperienceDetailPageFeature({
  experience
}: ExperienceDetailPageProps) {
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

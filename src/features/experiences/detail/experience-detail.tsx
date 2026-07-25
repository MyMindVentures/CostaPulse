import { Container } from "@/components/ui/container";
import type { ExperienceDetailViewModel } from "@/server/repositories/catalog";
import type { BookingStoryPage } from "@/lib/view-models/booking-story";
import { ExperienceBookingStories } from "../booking-stories/experience-booking-stories";
import { BookingWidget } from "./booking-widget";
import { DetailBreadcrumbs } from "./detail-breadcrumbs";
import { DetailHero } from "./detail-hero";
import { DetailHighlightsBar } from "./detail-highlights-bar";
import { DetailTabs } from "./detail-tabs";
import { MapPreview } from "./map-preview";
import { MeetingPointsCard } from "./meeting-points-card";

type ExperienceDetailProps = {
  experience: ExperienceDetailViewModel;
  bookingStories?: BookingStoryPage;
};

export async function ExperienceDetail({
  experience,
  bookingStories
}: ExperienceDetailProps) {
  return (
    <main className="xp-detail-page">
      <Container className="xp-detail-top">
        <DetailBreadcrumbs title={experience.title} />
      </Container>

      <DetailHero experience={experience} />
      <DetailHighlightsBar highlights={experience.highlights} />

      <section className="xp-detail-body">
        <Container className="xp-detail-layout grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.9fr)]">
          <div className="xp-detail-main min-w-0">
            <DetailTabs experience={experience} />
          </div>

          <aside className="xp-detail-sidebar grid gap-4 lg:sticky lg:top-[calc(var(--shell-nav-height)+1rem)]">
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
      {bookingStories && bookingStories.items.length > 0 ? (
        <ExperienceBookingStories
          experienceSlug={experience.slug}
          initialPage={bookingStories}
        />
      ) : null}
    </main>
  );
}

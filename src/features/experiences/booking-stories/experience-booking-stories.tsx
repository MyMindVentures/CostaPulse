"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BookingStory,
  BookingStoryPage
} from "@/lib/view-models/booking-story";
import { BookingStoryCard } from "./booking-story-card";
import { BookingStoryViewer } from "./booking-story-viewer";

export function ExperienceBookingStories({
  experienceSlug,
  initialPage
}: {
  experienceSlug: string;
  initialPage: BookingStoryPage;
}) {
  const t = useTranslations("BookingStories");
  const [stories, setStories] = useState(initialPage.items);
  const [nextOffset, setNextOffset] = useState(initialPage.nextOffset);
  const [selected, setSelected] = useState<BookingStory | null>(null);
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps"
  });
  const loading = useRef(false);

  const loadMore = useCallback(async () => {
    if (nextOffset === null || loading.current) return;
    loading.current = true;
    try {
      const params = new URLSearchParams({
        limit: "6",
        offset: String(nextOffset)
      });
      const response = await fetch(
        `/api/experiences/${encodeURIComponent(experienceSlug)}/booking-stories?${params}`
      );
      if (!response.ok) return;
      const page = (await response.json()) as BookingStoryPage;
      setStories((current) => {
        const ids = new Set(current.map((story) => story.id));
        return [
          ...current,
          ...page.items.filter((story) => !ids.has(story.id))
        ];
      });
      setNextOffset(page.nextOffset);
    } finally {
      loading.current = false;
    }
  }, [experienceSlug, nextOffset]);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => {
      if (embla.selectedScrollSnap() >= embla.scrollSnapList().length - 2) {
        void loadMore();
      }
    };
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla, loadMore]);

  if (stories.length === 0) return null;

  return (
    <section
      className="bg-navy py-16 text-white sm:py-20"
      aria-labelledby="booking-stories-title"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-gold text-sm font-semibold tracking-[0.16em] uppercase">
              {t("kicker")}
            </p>
            <h2
              id="booking-stories-title"
              className="mt-2 text-3xl font-semibold sm:text-4xl"
            >
              {t("heading")}
            </h2>
            <p className="mt-2 text-white/70">{t("description")}</p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              className="grid size-11 place-items-center rounded-md border border-white/25"
              aria-label={t("previousStory")}
              onClick={() => embla?.scrollPrev()}
            >
              <ChevronLeft aria-hidden />
            </button>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-md border border-white/25"
              aria-label={t("nextStory")}
              onClick={() => embla?.scrollNext()}
            >
              <ChevronRight aria-hidden />
            </button>
          </div>
        </div>
        <div ref={emblaRef} className="overflow-hidden">
          <div className="-ml-4 flex touch-pan-y">
            {stories.map((story) => (
              <div
                key={story.id}
                className="min-w-0 flex-[0_0_88%] pl-4 sm:flex-[0_0_56%] lg:flex-[0_0_39%]"
              >
                <BookingStoryCard
                  story={story}
                  onOpen={() => setSelected(story)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <BookingStoryViewer
        story={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}

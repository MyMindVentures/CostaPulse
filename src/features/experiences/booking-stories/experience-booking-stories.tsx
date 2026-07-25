"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
  experienceTitle,
  initialPage
}: {
  experienceSlug: string;
  experienceTitle: string;
  initialPage: BookingStoryPage;
}) {
  const t = useTranslations("BookingStories");
  const [stories, setStories] = useState(initialPage.items);
  const [nextOffset, setNextOffset] = useState(initialPage.nextOffset);
  const [selected, setSelected] = useState<BookingStory | null>(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedSnap, setSelectedSnap] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps"
  });
  const loading = useRef(false);

  const loadMore = useCallback(async () => {
    if (nextOffset === null || loading.current) return;
    loading.current = true;
    setLoadingMore(true);
    setLoadError(false);
    try {
      const params = new URLSearchParams({
        limit: "6",
        offset: String(nextOffset)
      });
      const response = await fetch(
        `/api/experiences/${encodeURIComponent(experienceSlug)}/booking-stories?${params}`
      );
      if (!response.ok) {
        setLoadError(true);
        return;
      }
      const page = (await response.json()) as BookingStoryPage;
      setStories((current) => {
        const ids = new Set(current.map((story) => story.id));
        return [
          ...current,
          ...page.items.filter((story) => !ids.has(story.id))
        ];
      });
      setNextOffset(page.nextOffset);
    } catch {
      setLoadError(true);
    } finally {
      loading.current = false;
      setLoadingMore(false);
    }
  }, [experienceSlug, nextOffset]);

  useEffect(() => {
    if (!embla) return;
    const updateCarouselState = () => {
      setCanScrollPrevious(embla.canScrollPrev());
      setCanScrollNext(embla.canScrollNext());
      setSelectedSnap(embla.selectedScrollSnap());
      setSnapCount(embla.scrollSnapList().length);
      if (embla.selectedScrollSnap() >= embla.scrollSnapList().length - 2) {
        void loadMore();
      }
    };
    updateCarouselState();
    embla.on("select", updateCarouselState);
    embla.on("reInit", updateCarouselState);
    return () => {
      embla.off("select", updateCarouselState);
      embla.off("reInit", updateCarouselState);
    };
  }, [embla, loadMore]);

  if (stories.length === 0) return null;
  const canViewAll = stories.length > 1 || nextOffset !== null;

  async function showAllStories() {
    await loadMore();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        embla?.scrollTo(Math.max(embla.scrollSnapList().length - 1, 0));
      });
    });
  }

  return (
    <section
      className="border-border/60 border-y bg-white py-12 sm:py-14 lg:py-16"
      aria-labelledby="booking-stories-title"
    >
      <div className="mx-auto w-[calc(100%-1.25rem)] max-w-[90rem] sm:w-[calc(100%-3rem)]">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-coral-dark text-xs font-bold tracking-[0.12em] uppercase">
              {t("kicker")}
            </p>
            <h2
              id="booking-stories-title"
              className="text-navy mt-2 font-serif text-[clamp(2.3rem,4vw,3rem)] leading-none"
            >
              {t("heading")}
            </h2>
            <p className="text-muted mt-3 max-w-2xl text-sm sm:text-base">
              {t("description")}
            </p>
          </div>
          {canViewAll ? (
            <button
              type="button"
              className="text-turquoise-deep hidden min-h-11 shrink-0 items-center gap-2 text-sm font-bold sm:inline-flex"
              disabled={loadingMore}
              onClick={() => void showAllStories()}
            >
              {t("viewAllStories")}
              <ArrowRight className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            className="border-turquoise-deep text-turquoise-deep absolute top-1/2 -left-7 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border bg-white shadow-sm disabled:cursor-not-allowed disabled:opacity-30 lg:grid"
            aria-label={t("previousStory")}
            disabled={!canScrollPrevious}
            onClick={() => embla?.scrollPrev()}
          >
            <ChevronLeft aria-hidden />
          </button>
          <div
            ref={emblaRef}
            className="focus-visible:outline-turquoise overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4"
            role="region"
            aria-label={t("railLabel")}
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                embla?.scrollPrev();
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                embla?.scrollNext();
              }
              if (event.key === "Home") {
                event.preventDefault();
                embla?.scrollTo(0);
              }
              if (event.key === "End") {
                event.preventDefault();
                embla?.scrollTo(Math.max(snapCount - 1, 0));
              }
            }}
          >
            <div className="-ml-5 flex touch-pan-y">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="min-w-0 flex-[0_0_86%] pl-5 sm:flex-[0_0_52%] md:flex-[0_0_41%] lg:flex-[0_0_29%] xl:flex-[0_0_22.5%]"
                >
                  <BookingStoryCard
                    story={story}
                    onOpen={() => setSelected(story)}
                  />
                </div>
              ))}
              {loadingMore ? (
                <div
                  className="min-w-0 flex-[0_0_86%] pl-5 sm:flex-[0_0_52%] md:flex-[0_0_41%] lg:flex-[0_0_29%] xl:flex-[0_0_22.5%]"
                  role="status"
                  aria-label={t("loadingMore")}
                >
                  <div className="bg-sand h-[19rem] animate-pulse rounded-[var(--radius)] border border-[var(--border)] motion-reduce:animate-none" />
                </div>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            className="border-turquoise-deep text-turquoise-deep absolute top-1/2 -right-7 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border bg-white shadow-sm disabled:cursor-not-allowed disabled:opacity-30 lg:grid"
            aria-label={t("nextStory")}
            disabled={!canScrollNext}
            onClick={() => embla?.scrollNext()}
          >
            <ChevronRight aria-hidden />
          </button>
        </div>

        {snapCount > 1 ? (
          <div
            className="mx-auto mt-5 flex max-w-full justify-center gap-2 overflow-hidden"
            aria-hidden
          >
            {Array.from({ length: snapCount }, (_, snapIndex) => (
              <span
                key={`story-snap-${snapIndex}`}
                className={`h-1 w-9 shrink-0 rounded-full transition-colors motion-reduce:transition-none ${
                  snapIndex === selectedSnap ? "bg-turquoise-deep" : "bg-border"
                }`}
              />
            ))}
          </div>
        ) : null}
        {loadError ? (
          <p className="text-muted mt-3 text-center text-sm" role="status">
            {t("loadError")}
          </p>
        ) : null}
        {canViewAll ? (
          <button
            type="button"
            className="text-turquoise-deep mx-auto mt-5 flex min-h-11 items-center gap-2 text-sm font-bold sm:hidden"
            disabled={loadingMore}
            onClick={() => void showAllStories()}
          >
            {t("viewAllStories")}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
      <BookingStoryViewer
        story={selected}
        experienceTitle={experienceTitle}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}

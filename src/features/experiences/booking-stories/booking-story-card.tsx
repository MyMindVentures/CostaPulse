"use client";

import {
  ArrowRight,
  CalendarDays,
  Camera,
  Film,
  Play,
  Star
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { BookingStory } from "@/lib/view-models/booking-story";
import {
  formatStoryMonth,
  getCountryFlag,
  getGuestInitials
} from "./booking-story-format";
import { BookingStoryMedia } from "./booking-story-media";

export function BookingStoryCard({
  story,
  onOpen
}: {
  story: BookingStory;
  onOpen: () => void;
}) {
  const t = useTranslations("BookingStories");
  const locale = useLocale();
  const date = formatStoryMonth(story.experienceDate, locale);
  const countryFlag = getCountryFlag(story.guestCountryCode);
  const guestInitials = getGuestInitials(story.guestDisplayName);
  const displayName = story.guestDisplayName ?? story.title;
  const rating = story.rating ?? 0;

  return (
    <article className="group border-border relative flex h-full min-h-[19rem] flex-col overflow-hidden rounded-[var(--radius)] border bg-white shadow-[0_0.65rem_1.6rem_rgba(7,31,47,0.09)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_0.9rem_2rem_rgba(7,31,47,0.13)] motion-reduce:transition-none">
      <button
        type="button"
        onClick={onOpen}
        className="bg-navy relative block aspect-[16/10] w-full overflow-hidden text-left"
        aria-label={t("viewStoryLabel", { title: story.title })}
      >
        <span
          className="absolute inset-0"
          style={{
            backgroundColor: story.coverMedia?.dominantColor ?? undefined
          }}
        >
          {story.coverMedia ? (
            <BookingStoryMedia
              media={story.coverMedia}
              active={false}
              preview
              sizes="(max-width: 640px) 86vw, (max-width: 768px) 52vw, (max-width: 1024px) 41vw, (max-width: 1280px) 29vw, 22.5vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transition-none"
            />
          ) : null}
        </span>
        <span className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3">
          {story.imageCount ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Camera className="size-3.5" aria-hidden />
              {t("photoCount", { count: story.imageCount })}
            </span>
          ) : (
            <span />
          )}
          {story.videoCount ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Film className="size-3.5" aria-hidden />
              {t("videoCount", { count: story.videoCount })}
            </span>
          ) : null}
        </span>
        {story.videoCount ? (
          <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-black/20 text-white backdrop-blur-sm">
            <Play className="ml-0.5 size-5 fill-current" aria-hidden />
          </span>
        ) : null}
        {story.isFeatured ? (
          <span className="bg-gold text-navy absolute bottom-3 left-3 rounded-sm px-2 py-1 text-[0.68rem] font-bold tracking-wide uppercase">
            {t("featured")}
          </span>
        ) : null}
      </button>

      <div className="text-ink relative flex flex-1 flex-col px-4 pt-3 pb-2">
        <div className="-mt-8 mb-1.5 flex min-h-12 items-end gap-2.5">
          <div className="bg-sand text-navy grid size-11 shrink-0 place-items-center rounded-full border-[3px] border-white text-xs font-bold shadow-sm">
            {guestInitials ?? "CP"}
          </div>
          <div className="min-w-0 pb-0.5">
            <h3 className="truncate font-sans text-sm font-bold tracking-normal">
              {displayName}
            </h3>
            {story.guestCountryCode ? (
              <p className="text-muted mt-0.5 truncate text-xs">
                {countryFlag ? (
                  <span className="mr-1" aria-hidden>
                    {countryFlag}
                  </span>
                ) : null}
                {story.guestCountryCode}
              </p>
            ) : null}
          </div>
        </div>

        {rating > 0 ? (
          <div
            className="mt-2 flex items-center gap-1"
            aria-label={t("ratingLabel", { rating })}
          >
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={`size-4 ${
                  index < rating ? "fill-gold text-gold" : "text-border"
                }`}
                aria-hidden
              />
            ))}
            <span className="text-navy ml-1 text-xs font-semibold">
              {rating.toFixed(1)}
            </span>
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          {date ? (
            <time
              dateTime={story.experienceDate ?? undefined}
              className="text-muted inline-flex items-center gap-1.5 text-xs"
            >
              <CalendarDays className="size-3.5" aria-hidden />
              {date}
            </time>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onOpen}
            className="text-turquoise-deep inline-flex min-h-11 items-center gap-1.5 text-xs font-bold"
            aria-label={t("viewStoryLabel", { title: story.title })}
          >
            {t("viewStory")}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}

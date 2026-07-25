"use client";

import { Camera, Film, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import type { BookingStory } from "@/lib/view-models/booking-story";
import { BookingStoryMedia } from "./booking-story-media";

export function BookingStoryCard({
  story,
  onOpen
}: {
  story: BookingStory;
  onOpen: () => void;
}) {
  const t = useTranslations("BookingStories");
  const date = story.experienceDate
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(story.experienceDate)
      )
    : null;

  return (
    <article className="group bg-navy-soft relative flex h-full min-h-[31rem] flex-col overflow-hidden rounded-[var(--radius)] border border-white/15 text-white shadow-[var(--shadow)]">
      <div
        className="bg-navy relative min-h-72 flex-1 overflow-hidden"
        style={{
          backgroundColor: story.coverMedia?.dominantColor ?? undefined
        }}
      >
        {story.coverMedia ? (
          <BookingStoryMedia
            media={story.coverMedia}
            active={false}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transition-none"
          />
        ) : null}
        <div className="from-navy via-navy/15 absolute inset-0 bg-gradient-to-t to-transparent" />
        {story.isFeatured ? (
          <span className="bg-gold text-navy absolute top-4 left-4 rounded-sm px-2.5 py-1 text-xs font-semibold">
            {t("featured")}
          </span>
        ) : null}
      </div>
      <div className="absolute inset-x-0 bottom-0 grid gap-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
          {story.guestDisplayName ? (
            <span>{story.guestDisplayName}</span>
          ) : null}
          {story.guestCountryCode ? (
            <span>{story.guestCountryCode}</span>
          ) : null}
          {date ? (
            <time dateTime={story.experienceDate ?? undefined}>{date}</time>
          ) : null}
        </div>
        <h3 className="text-2xl font-semibold tracking-tight">{story.title}</h3>
        {story.guestQuote ? (
          <p className="line-clamp-2 text-sm text-white/85">
            “{story.guestQuote}”
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
          {story.rating ? (
            <span className="inline-flex items-center gap-1">
              <Star className="fill-gold text-gold size-3.5" aria-hidden />
              {story.rating}
            </span>
          ) : null}
          {story.imageCount ? (
            <span className="inline-flex items-center gap-1">
              <Camera className="size-3.5" aria-hidden />
              {story.imageCount}
            </span>
          ) : null}
          {story.videoCount ? (
            <span className="inline-flex items-center gap-1">
              <Film className="size-3.5" aria-hidden />
              {story.videoCount}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="button button-gold mt-1 min-h-11 justify-self-start"
          aria-label={t("viewStoryLabel", { title: story.title })}
        >
          {t("viewStory")}
        </button>
      </div>
    </article>
  );
}

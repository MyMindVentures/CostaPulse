"use client";

import {
  ArrowRight,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  Film,
  Play,
  Star,
  X
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";
import type { BookingStory } from "@/lib/view-models/booking-story";
import { formatStoryMonth, getCountryFlag } from "./booking-story-format";
import { BookingStoryMedia } from "./booking-story-media";

export function BookingStoryViewer({
  story,
  experienceTitle,
  open,
  onClose
}: {
  story: BookingStory | null;
  experienceTitle?: string;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("BookingStories");
  const locale = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const pointerStart = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const media = story?.mediaItems ?? [];
  const experienceDate = formatStoryMonth(
    story?.experienceDate ?? null,
    locale
  );
  const countryFlag = getCountryFlag(story?.guestCountryCode ?? null);
  const rating = story?.rating ?? 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      setIndex(0);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const restore = () => {
      onClose();
      openerRef.current?.focus();
    };
    dialog.addEventListener("close", restore);
    return () => dialog.removeEventListener("close", restore);
  }, [onClose]);

  function move(delta: number) {
    if (media.length === 0) return;
    setIndex((current) => (current + delta + media.length) % media.length);
  }

  function handlePointerDown(event: ReactPointerEvent) {
    pointerStart.current = event.clientX;
  }

  function handlePointerUp(event: ReactPointerEvent) {
    if (pointerStart.current === null) return;
    const delta = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(delta) >= 50) move(delta < 0 ? 1 : -1);
  }

  function closeAndFocus(target: "booking" | "reviews") {
    dialogRef.current?.close();
    window.setTimeout(() => {
      const reducedMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
        false;
      if (target === "reviews") {
        const reviewsTab = document.querySelector<HTMLButtonElement>(
          '[data-experience-tab="reviews"]'
        );
        reviewsTab?.click();
        reviewsTab?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start"
        });
        reviewsTab?.focus({ preventScroll: true });
        return;
      }
      const booking = document.getElementById("booking");
      booking?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });
      booking?.setAttribute("tabindex", "-1");
      booking?.focus({ preventScroll: true });
    }, 0);
  }

  const active = media[index] ?? null;
  const displayName = story?.guestDisplayName ?? story?.title ?? "";
  const hasPublishedReview = Boolean(
    story?.rating || story?.reviewTitle || story?.reviewExcerpt
  );

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-navy/70 m-auto h-dvh max-h-dvh w-screen max-w-none bg-transparent p-0 text-white backdrop:backdrop-blur-[2px] lg:h-[min(78dvh,31rem)] lg:w-[calc(100%-2rem)] lg:max-w-[88rem]"
      aria-label={story ? t("viewerLabel", { title: story.title }) : undefined}
      onCancel={(event) => {
        event.preventDefault();
        dialogRef.current?.close();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
        if (event.key === "Home") setIndex(0);
        if (event.key === "End") setIndex(Math.max(media.length - 1, 0));
      }}
    >
      {story && active ? (
        <div className="bg-navy-deep relative grid h-full min-h-0 overflow-hidden shadow-[var(--shadow)] lg:grid-cols-[minmax(0,1.42fr)_minmax(23rem,1fr)] lg:rounded-[var(--radius)]">
          <button
            type="button"
            className="absolute top-3 right-3 z-30 grid size-11 place-items-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur-sm lg:top-4 lg:right-4"
            aria-label={t("close")}
            onClick={() => dialogRef.current?.close()}
          >
            <X aria-hidden />
          </button>

          <section className="grid min-h-[55svh] grid-rows-[minmax(0,1fr)_5.75rem] bg-black lg:min-h-0">
            <div
              className="relative min-h-0 overflow-hidden"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            >
              <div className="relative h-full">
                <BookingStoryMedia
                  key={active.id}
                  media={active}
                  sizes="(max-width: 1024px) 100vw, 62vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="absolute top-4 left-4 z-10 rounded-md bg-black/65 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                {t("mediaCounter", {
                  current: index + 1,
                  total: media.length
                })}
              </span>
              {media.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="absolute top-1/2 left-4 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-black/25 backdrop-blur-sm"
                    aria-label={t("previousMedia")}
                    onClick={() => move(-1)}
                  >
                    <ChevronLeft aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="absolute top-1/2 right-4 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-black/25 backdrop-blur-sm"
                    aria-label={t("nextMedia")}
                    onClick={() => move(1)}
                  >
                    <ChevronRight aria-hidden />
                  </button>
                </>
              ) : null}
            </div>

            <div
              className="flex max-w-full gap-2 overflow-x-auto bg-black/95 px-4 py-2.5"
              aria-label={t("thumbnails")}
            >
              {media.map((item, itemIndex) => (
                <button
                  key={item.id}
                  type="button"
                  className={`relative h-[4.5rem] w-24 shrink-0 overflow-hidden rounded-md border-2 ${
                    itemIndex === index
                      ? "border-gold"
                      : "border-transparent opacity-75"
                  }`}
                  aria-label={t("goToMedia", { number: itemIndex + 1 })}
                  aria-current={itemIndex === index ? "true" : undefined}
                  onClick={() => setIndex(itemIndex)}
                >
                  <BookingStoryMedia
                    media={item}
                    active={false}
                    sizes="96px"
                    className="h-full w-full object-cover"
                  />
                  {item.mediaType === "video" ? (
                    <span className="absolute inset-0 grid place-items-center bg-black/15 text-white">
                      <span className="grid size-6 place-items-center rounded-full border border-white/80 bg-black/35">
                        <Play
                          className="ml-px size-3 fill-current"
                          aria-hidden
                        />
                      </span>
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </section>

          <aside className="bg-navy relative flex min-h-0 flex-col overflow-y-auto px-5 py-7 sm:px-7 lg:px-8 lg:py-7">
            <div className="pr-12">
              {experienceTitle ? (
                <p className="text-turquoise flex items-center gap-2 text-xs font-semibold">
                  {experienceTitle}
                </p>
              ) : null}
              <h2 className="mt-3 font-serif text-4xl leading-none">
                {displayName}
              </h2>
              {story.guestDisplayName ? (
                <p className="mt-2 text-sm text-white/65">{story.title}</p>
              ) : null}
            </div>

            {story.guestCountryCode || experienceDate ? (
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/80">
                {story.guestCountryCode ? (
                  <span>
                    {countryFlag ? (
                      <span className="mr-1.5" aria-hidden>
                        {countryFlag}
                      </span>
                    ) : null}
                    {story.guestCountryCode}
                  </span>
                ) : null}
                {story.guestCountryCode && experienceDate ? (
                  <span aria-hidden>·</span>
                ) : null}
                {experienceDate ? (
                  <time
                    dateTime={story.experienceDate ?? undefined}
                    className="inline-flex items-center gap-1.5"
                  >
                    <CalendarDays
                      className="size-4 text-white/55"
                      aria-hidden
                    />
                    {experienceDate}
                  </time>
                ) : null}
              </div>
            ) : null}

            {rating > 0 ? (
              <div
                className="mt-5 flex items-center gap-1"
                aria-label={t("ratingLabel", { rating })}
              >
                {Array.from({ length: 5 }, (_, starIndex) => (
                  <Star
                    key={starIndex}
                    className={`size-5 ${
                      starIndex < rating
                        ? "fill-gold text-gold"
                        : "text-white/25"
                    }`}
                    aria-hidden
                  />
                ))}
                <span className="ml-2 text-sm font-semibold">
                  {rating.toFixed(1)}
                </span>
              </div>
            ) : null}

            {story.guestQuote ? (
              <blockquote className="border-turquoise/55 mt-6 border-l-2 pl-4 text-sm leading-6 text-white/90 italic sm:text-base">
                “{story.guestQuote}”
              </blockquote>
            ) : null}

            {story.reviewExcerpt ? (
              <div className="mt-5">
                {story.reviewTitle ? (
                  <p className="font-semibold">{story.reviewTitle}</p>
                ) : null}
                <p className="mt-1 text-sm leading-6 text-white/65">
                  {story.reviewExcerpt}
                </p>
              </div>
            ) : null}

            {active.caption ? (
              <p className="mt-5 text-xs leading-5 text-white/55">
                {active.caption}
              </p>
            ) : null}

            {story.imageCount || story.videoCount ? (
              <dl className="mt-auto grid grid-cols-2 divide-x divide-white/10 rounded-md border border-white/15 bg-white/[0.025] py-3 text-center">
                {story.imageCount ? (
                  <div className="px-3">
                    <dt className="text-xs text-white/60">{t("photos")}</dt>
                    <dd className="mt-1 inline-flex items-center gap-2 text-xl font-semibold">
                      <Camera className="size-5" aria-hidden />
                      {story.imageCount}
                    </dd>
                  </div>
                ) : null}
                {story.videoCount ? (
                  <div className="px-3">
                    <dt className="text-xs text-white/60">{t("videos")}</dt>
                    <dd className="mt-1 inline-flex items-center gap-2 text-xl font-semibold">
                      <Film className="size-5" aria-hidden />
                      {story.videoCount}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {hasPublishedReview ? (
                <button
                  type="button"
                  className="border-turquoise text-turquoise inline-flex min-h-12 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold"
                  onClick={() => closeAndFocus("reviews")}
                >
                  {t("viewAllReviews")}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              ) : null}
              <button
                type="button"
                className="button button-gold min-h-12 justify-center"
                onClick={() => closeAndFocus("booking")}
              >
                {t("bookExperience")}
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </dialog>
  );
}

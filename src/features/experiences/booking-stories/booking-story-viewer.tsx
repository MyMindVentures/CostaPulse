"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";
import type { BookingStory } from "@/lib/view-models/booking-story";
import { BookingStoryMedia } from "./booking-story-media";

export function BookingStoryViewer({
  story,
  open,
  onClose
}: {
  story: BookingStory | null;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("BookingStories");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const pointerStart = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const media = story?.mediaItems ?? [];

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

  const active = media[index] ?? null;

  return (
    <dialog
      ref={dialogRef}
      className="bg-navy backdrop:bg-navy/90 m-auto h-dvh max-h-dvh w-screen max-w-none p-0 text-white"
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
        <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
          <header className="flex items-center justify-between gap-4 border-b border-white/15 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="truncate font-semibold">{story.title}</p>
              <p className="text-xs text-white/70">
                {t("mediaCounter", { current: index + 1, total: media.length })}
              </p>
            </div>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-md border border-white/25"
              aria-label={t("close")}
              onClick={() => dialogRef.current?.close()}
            >
              <X aria-hidden />
            </button>
          </header>

          <div
            className="relative min-h-0 overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            <div className="relative mx-auto h-full max-w-6xl">
              <BookingStoryMedia
                key={active.id}
                media={active}
                className="h-full w-full object-contain"
              />
            </div>
            {media.length > 1 ? (
              <>
                <button
                  type="button"
                  className="bg-navy/75 absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-md"
                  aria-label={t("previousMedia")}
                  onClick={() => move(-1)}
                >
                  <ChevronLeft aria-hidden />
                </button>
                <button
                  type="button"
                  className="bg-navy/75 absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-md"
                  aria-label={t("nextMedia")}
                  onClick={() => move(1)}
                >
                  <ChevronRight aria-hidden />
                </button>
              </>
            ) : null}
          </div>

          <footer className="grid gap-3 border-t border-white/15 px-4 py-4 sm:grid-cols-[1fr_auto] sm:px-6">
            <div>
              {active.caption ? (
                <p className="text-sm text-white/80">{active.caption}</p>
              ) : null}
              {story.guestQuote ? (
                <blockquote className="mt-1 text-sm">
                  “{story.guestQuote}”
                </blockquote>
              ) : null}
              {story.reviewExcerpt ? (
                <p className="mt-1 text-xs text-white/65">
                  {story.reviewExcerpt}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="button button-gold min-h-11"
              onClick={() => {
                dialogRef.current?.close();
                window.setTimeout(() => {
                  const booking = document.getElementById("booking");
                  booking?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                  });
                  booking?.setAttribute("tabindex", "-1");
                  booking?.focus({ preventScroll: true });
                }, 0);
              }}
            >
              {t("bookExperience")}
            </button>
          </footer>
        </div>
      ) : null}
    </dialog>
  );
}

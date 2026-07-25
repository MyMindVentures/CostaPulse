"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BookingStoryCard } from "@/features/experiences/booking-stories/booking-story-card";
import { BookingStoryViewer } from "@/features/experiences/booking-stories/booking-story-viewer";
import type { BookingStory } from "@/lib/view-models/booking-story";
import type {
  AdminBookingStoryDetail,
  BookingFootageUploadPolicy
} from "@/server/repositories/admin-booking-stories";
import {
  bookingStoryPublicationAction,
  updateBookingStoryAction
} from "@/server/admin/actions-booking-stories";
import { BookingStoryStatusBadge } from "./booking-story-status-badge";
import { BookingStoryMediaManager } from "./booking-story-media-manager";

export function BookingStoryEditor({
  detail,
  uploadPolicy
}: {
  detail: AdminBookingStoryDetail;
  uploadPolicy: BookingFootageUploadPolicy;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const story = detail.story;
  const previewMedia = detail.media.flatMap((item) =>
    item.signedUrl
      ? [
          {
            id: item.asset.id,
            url: item.signedUrl,
            mediaType: item.asset.mediaType === "video" ? "video" : "image",
            mimeType: item.asset.mimeType,
            width: item.asset.width,
            height: item.asset.height,
            durationSeconds: null,
            altText: item.asset.altText?.trim() || story.title,
            caption: item.caption,
            role: item.media_role,
            displayOrder: item.display_order,
            isPrimary: item.is_primary,
            blurhash: null,
            dominantColor: null
          }
        ]
      : []
  ) satisfies BookingStory["mediaItems"];
  const previewStory: BookingStory | null =
    previewMedia.length > 0
      ? {
          id: story.id,
          title: story.title,
          subtitle: story.subtitle,
          description: story.description,
          guestDisplayName: story.guest_display_name,
          guestCountryCode: story.guest_country_code,
          guestQuote: story.guest_quote,
          isFeatured: story.is_featured,
          sortOrder: story.display_order,
          publishedAt: story.published_at,
          experienceDate: detail.booking.bookingDate,
          rating: null,
          reviewTitle: null,
          reviewExcerpt: null,
          coverMedia:
            previewMedia.find(
              (item) => item.id === story.cover_media_asset_id
            ) ??
            previewMedia[0] ??
            null,
          mediaItems: previewMedia,
          imageCount: previewMedia.filter((item) => item.mediaType === "image")
            .length,
          videoCount: previewMedia.filter((item) => item.mediaType === "video")
            .length
        }
      : null;
  const blockers = [
    detail.booking.status !== "completed" ? "Booking is not completed" : null,
    story.consent_status !== "granted" ? "Consent is not granted" : null,
    detail.media.length === 0 ? "No media is attached" : null,
    !story.cover_media_asset_id ? "No cover is selected" : null,
    story.cover_media_asset_id &&
    !detail.media.some(
      (item) => item.media_asset_id === story.cover_media_asset_id
    )
      ? "Cover is not linked to this story"
      : null
  ].filter((item): item is string => item !== null);

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted text-sm">
            {detail.experience.title} · {detail.booking.bookingReference}
          </p>
          <h1 className="text-ink mt-2 text-3xl font-semibold">
            {story.title}
          </h1>
        </div>
        <BookingStoryStatusBadge status={story.status} />
      </header>

      <form
        className="grid gap-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          const result = await updateBookingStoryAction(
            new FormData(event.currentTarget)
          );
          setPending(false);
          if (!result.ok) toast.error(result.message);
          else {
            toast.success("Draft saved");
            router.refresh();
          }
        }}
      >
        <input type="hidden" name="storyId" value={story.id} />
        <section className="border-border grid gap-4 rounded-[var(--radius)] border bg-white p-5 md:grid-cols-2">
          <h2 className="text-ink text-xl font-semibold md:col-span-2">
            Story details
          </h2>
          <Field
            label="Title"
            name="title"
            required
            defaultValue={story.title}
          />
          <Field
            label="Subtitle"
            name="subtitle"
            defaultValue={story.subtitle}
          />
          <label className="text-sm md:col-span-2">
            Description
            <textarea
              name="description"
              defaultValue={story.description ?? ""}
              className="border-input mt-1 min-h-28 w-full rounded-md border p-3"
            />
          </label>
          <Field
            label="Public guest display name"
            name="guestDisplayName"
            defaultValue={story.guest_display_name}
            hint="This is public and is not the private booking contact name."
          />
          <Field
            label="Country code"
            name="guestCountryCode"
            defaultValue={story.guest_country_code}
            maxLength={2}
          />
          <label className="text-sm md:col-span-2">
            Guest quote
            <textarea
              name="guestQuote"
              defaultValue={story.guest_quote ?? ""}
              className="border-input mt-1 min-h-24 w-full rounded-md border p-3"
            />
          </label>
          <Field
            label="Display order"
            name="displayOrder"
            type="number"
            min={0}
            defaultValue={String(story.display_order)}
          />
          <label className="flex min-h-11 items-center gap-2 self-end text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={story.is_featured}
            />
            Featured story
          </label>
        </section>

        <section className="border-border grid gap-4 rounded-[var(--radius)] border bg-white p-5 md:grid-cols-2">
          <h2 className="text-ink text-xl font-semibold md:col-span-2">
            Consent
          </h2>
          <label className="text-sm">
            Consent status
            <select
              name="consentStatus"
              defaultValue={story.consent_status}
              className="border-input mt-1 min-h-11 w-full rounded-md border px-3"
            >
              <option value="pending">Pending</option>
              <option value="granted">Granted</option>
              <option value="revoked">Revoked</option>
            </select>
          </label>
          <Field
            label="Consent source"
            name="consentSource"
            defaultValue={story.consent_source}
          />
          <div className="text-sm md:col-span-2">
            <span className="text-muted">Consent received</span>
            <p>{story.consent_received_at ?? "Not received"}</p>
          </div>
          {story.consent_status !== "granted" ? (
            <Alert variant="destructive" className="md:col-span-2">
              <AlertTitle>Publishing is blocked</AlertTitle>
              <AlertDescription>
                Consent must be granted. The backend remains the final
                authority.
              </AlertDescription>
            </Alert>
          ) : null}
        </section>
        <Button
          type="submit"
          disabled={pending}
          className="min-h-11 justify-self-start"
        >
          {pending ? "Saving…" : "Save draft"}
        </Button>
      </form>

      <BookingStoryMediaManager
        storyId={story.id}
        initialMedia={detail.media}
        uploadPolicy={uploadPolicy}
      />

      <section className="border-border rounded-[var(--radius)] border bg-white p-5">
        <h2 className="text-ink text-xl font-semibold">Preview</h2>
        <p className="text-muted mt-1 text-sm">
          Uses the same card and fullscreen viewer as the public experience
          page.
        </p>
        {previewStory ? (
          <div className="mt-4 max-w-md">
            <BookingStoryCard
              story={previewStory}
              onOpen={() => setPreviewOpen(true)}
            />
            <BookingStoryViewer
              story={previewStory}
              open={previewOpen}
              onClose={() => setPreviewOpen(false)}
            />
          </div>
        ) : (
          <p className="text-muted mt-4">Attach media to preview this story.</p>
        )}
      </section>

      <section className="border-border rounded-[var(--radius)] border bg-white p-5">
        <h2 className="text-ink text-xl font-semibold">Publication controls</h2>
        {blockers.length > 0 ? (
          <ul className="text-muted mt-3 list-disc pl-5 text-sm">
            {blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            type="button"
            disabled={pending || blockers.length > 0}
            onClick={async () => {
              setPending(true);
              const result = await bookingStoryPublicationAction(
                story.id,
                "publish"
              );
              setPending(false);
              if (!result.ok) toast.error(result.message);
              else {
                toast.success("Story published");
                router.refresh();
              }
            }}
          >
            Publish
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              const result = await bookingStoryPublicationAction(
                story.id,
                "archive"
              );
              setPending(false);
              if (!result.ok) toast.error(result.message);
              else router.refresh();
            }}
          >
            Archive
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              window.open(
                `/experiences/${detail.experience.slug}`,
                "_blank",
                "noopener"
              )
            }
          >
            Preview public page
          </Button>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  hint,
  ...props
}: {
  label: string;
  hint?: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  type?: string;
  min?: number;
  maxLength?: number;
}) {
  return (
    <label className="text-sm">
      {label}
      <input
        {...props}
        defaultValue={props.defaultValue ?? ""}
        className="border-input mt-1 min-h-11 w-full rounded-md border px-3"
      />
      {hint ? (
        <span className="text-muted mt-1 block text-xs">{hint}</span>
      ) : null}
    </label>
  );
}

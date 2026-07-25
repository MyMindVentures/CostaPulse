import { z } from "zod";

const nullableText = z.string().nullable();

export const bookingStoryMediaRoleSchema = z.enum([
  "cover",
  "gallery",
  "highlight",
  "video",
  "thumbnail"
]);

const rawBookingStoryMediaSchema = z.object({
  id: z.string().uuid(),
  bucket_id: z.string(),
  storage_path: z.string(),
  media_type: z.enum(["image", "video"]),
  mime_type: nullableText,
  width: z.coerce.number().int().positive().nullable(),
  height: z.coerce.number().int().positive().nullable(),
  duration_seconds: z.coerce.number().nonnegative().nullable(),
  alt_text: nullableText,
  caption: nullableText,
  role: bookingStoryMediaRoleSchema,
  display_order: z.coerce.number().int().nonnegative(),
  is_primary: z.boolean(),
  blurhash: nullableText,
  dominant_color: nullableText
});

const rawCoverMediaSchema = rawBookingStoryMediaSchema
  .omit({ role: true, display_order: true, is_primary: true })
  .extend({
    role: bookingStoryMediaRoleSchema.optional().default("cover"),
    display_order: z.coerce.number().int().nonnegative().optional().default(0),
    is_primary: z.boolean().optional().default(true)
  });

export const rawBookingStorySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  subtitle: nullableText,
  description: nullableText,
  guest_display_name: nullableText,
  guest_country_code: nullableText,
  guest_quote: nullableText,
  is_featured: z.boolean(),
  sort_order: z.coerce.number().int().nonnegative(),
  published_at: nullableText,
  experience_date: nullableText,
  rating: z.coerce.number().int().min(1).max(5).nullable(),
  review_title: nullableText,
  review_excerpt: nullableText,
  cover_media: rawCoverMediaSchema.nullable(),
  media_items: z.array(rawBookingStoryMediaSchema)
});

export const rawBookingStoriesSchema = z.array(rawBookingStorySchema);

export type BookingStoryMedia = {
  id: string;
  url: string;
  mediaType: "image" | "video";
  mimeType: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  altText: string;
  caption: string | null;
  role: z.infer<typeof bookingStoryMediaRoleSchema>;
  displayOrder: number;
  isPrimary: boolean;
  blurhash: string | null;
  dominantColor: string | null;
};

export type BookingStory = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  guestDisplayName: string | null;
  guestCountryCode: string | null;
  guestQuote: string | null;
  isFeatured: boolean;
  sortOrder: number;
  publishedAt: string | null;
  experienceDate: string | null;
  rating: number | null;
  reviewTitle: string | null;
  reviewExcerpt: string | null;
  coverMedia: BookingStoryMedia | null;
  mediaItems: BookingStoryMedia[];
  imageCount: number;
  videoCount: number;
};

export type BookingStoryPage = {
  items: BookingStory[];
  nextOffset: number | null;
};

export type RawBookingStory = z.infer<typeof rawBookingStorySchema>;

type SignedUrlLookup = ReadonlyMap<string, string>;

function mediaKey(bucket: string, path: string) {
  return `${bucket}:${path}`;
}

function mapMedia(
  media: RawBookingStory["media_items"][number],
  urls: SignedUrlLookup,
  storyTitle: string
): BookingStoryMedia | null {
  if (media.bucket_id !== "booking-footage") return null;
  const url = urls.get(mediaKey(media.bucket_id, media.storage_path));
  if (!url) return null;
  return {
    id: media.id,
    url,
    mediaType: media.media_type,
    mimeType: media.mime_type,
    width: media.width,
    height: media.height,
    durationSeconds: media.duration_seconds,
    altText: media.alt_text?.trim() || storyTitle,
    caption: media.caption,
    role: media.role,
    displayOrder: media.display_order,
    isPrimary: media.is_primary,
    blurhash: media.blurhash,
    dominantColor: media.dominant_color
  };
}

export function getBookingStoryStoragePaths(stories: RawBookingStory[]) {
  return Array.from(
    new Set(
      stories.flatMap((story) =>
        story.media_items
          .filter(
            (media): media is NonNullable<typeof media> =>
              media?.bucket_id === "booking-footage"
          )
          .map((media) => media.storage_path)
      )
    )
  );
}

export function mapPublicBookingStories(
  stories: RawBookingStory[],
  signedUrls: SignedUrlLookup
): BookingStory[] {
  return stories.flatMap((story) => {
    const items = story.media_items
      .map((media) => mapMedia(media, signedUrls, story.title))
      .filter((media): media is BookingStoryMedia => media !== null)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    const mappedCover = story.cover_media
      ? (items.find((item) => item.id === story.cover_media?.id) ?? null)
      : null;
    const cover =
      mappedCover ??
      items.find((item) => item.isPrimary) ??
      items.find((item) => item.role === "cover") ??
      items[0] ??
      null;
    if (!cover || items.length === 0) return [];
    return [
      {
        id: story.id,
        title: story.title,
        subtitle: story.subtitle,
        description: story.description,
        guestDisplayName: story.guest_display_name,
        guestCountryCode: story.guest_country_code?.trim() || null,
        guestQuote: story.guest_quote,
        isFeatured: story.is_featured,
        sortOrder: story.sort_order,
        publishedAt: story.published_at,
        experienceDate: story.experience_date,
        rating: story.rating,
        reviewTitle: story.review_title,
        reviewExcerpt: story.review_excerpt,
        coverMedia: cover,
        mediaItems: items,
        imageCount: items.filter((item) => item.mediaType === "image").length,
        videoCount: items.filter((item) => item.mediaType === "video").length
      }
    ];
  });
}

export function bookingStoryMediaKey(bucket: string, path: string) {
  return mediaKey(bucket, path);
}

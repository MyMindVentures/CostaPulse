import "server-only";

import {
  bookingStoryMediaKey,
  getBookingStoryStoragePaths,
  mapPublicBookingStories,
  rawBookingStoriesSchema,
  type BookingStoryPage
} from "@/lib/view-models/booking-story";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const STORY_BUCKET = "booking-footage";
const SIGNED_URL_TTL_SECONDS = 3600;

export async function getPublicExperienceBookingStories({
  experienceSlug,
  limit = 6,
  offset = 0
}: {
  experienceSlug: string;
  limit?: number;
  offset?: number;
}): Promise<BookingStoryPage> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 24);
  const safeOffset = Math.max(Math.trunc(offset), 0);
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { items: [], nextOffset: null };

  const { data, error } = await supabase.rpc(
    "get_public_experience_booking_stories",
    {
      p_experience_slug: experienceSlug,
      p_limit: safeLimit + 1,
      p_offset: safeOffset
    }
  );
  if (error) throw new Error(error.message);

  const parsed = rawBookingStoriesSchema.parse(data);
  const hasMore = parsed.length > safeLimit;
  const visible = parsed.slice(0, safeLimit);
  const paths = getBookingStoryStoragePaths(visible);
  const admin = createSupabaseAdminClient();
  if (!admin || paths.length === 0) {
    return { items: [], nextOffset: null };
  }

  const { data: signed, error: signedError } = await admin.storage
    .from(STORY_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  if (signedError) throw new Error(signedError.message);

  const urls = new Map<string, string>();
  signed.forEach((item, index) => {
    if (item.signedUrl) {
      urls.set(
        bookingStoryMediaKey(STORY_BUCKET, paths[index]),
        item.signedUrl
      );
    }
  });

  return {
    items: mapPublicBookingStories(visible, urls),
    nextOffset: hasMore ? safeOffset + safeLimit : null
  };
}

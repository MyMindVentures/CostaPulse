import "server-only";

import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database";

type StoryRow = Database["public"]["Tables"]["booking_stories"]["Row"];
type StoryMediaRow = Database["public"]["Tables"]["booking_story_media"]["Row"];

export type BookingStoryMutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

export type AdminBookingStorySummary = {
  id: string;
  bookingId: string;
  kind: "eligible" | "story";
  title: string | null;
  experienceId: string;
  experienceTitle: string;
  bookingDate: string | null;
  guestDisplayName: string | null;
  mediaCount: number;
  consentStatus: "not_recorded" | "pending" | "granted" | "revoked";
  status: "eligible" | "draft" | "published" | "archived";
  isFeatured: boolean;
  updatedAt: string;
};

export type AdminBookingStoriesPage = {
  items: AdminBookingStorySummary[];
  page: number;
  pageSize: number;
  total: number;
  counts: Record<"eligible" | "draft" | "published" | "archived", number>;
  experiences: Array<{ id: string; title: string }>;
};

export type AdminBookingStoryDetail = {
  story: StoryRow;
  booking: {
    id: string;
    status: string;
    bookingReference: string;
    bookingDate: string | null;
  };
  experience: { id: string; title: string; slug: string };
  media: Array<
    StoryMediaRow & {
      asset: {
        id: string;
        bucketId: string;
        storagePath: string;
        mediaType: string;
        mimeType: string | null;
        altText: string | null;
        width: number | null;
        height: number | null;
      };
      signedUrl: string | null;
    }
  >;
};

export type BookingFootageUploadPolicy = {
  bucket: "booking-footage";
  fileSizeLimit: number;
  allowedMimeTypes: string[];
};

const storyStatusSchema = z.enum(["draft", "published", "archived"]);
const consentSchema = z.enum(["pending", "granted", "revoked"]);

function requireAdminClient() {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin access is not configured");
  return admin;
}

export async function getBookingFootageUploadPolicy(): Promise<BookingFootageUploadPolicy> {
  const admin = requireAdminClient();
  const { data, error } = await admin.storage.getBucket("booking-footage");
  if (error || !data) throw new Error(error?.message ?? "Bucket not found");
  return {
    bucket: "booking-footage",
    fileSizeLimit: data.file_size_limit ?? 0,
    allowedMimeTypes: data.allowed_mime_types ?? []
  };
}

export async function listAdminBookingStories(input: {
  status: "eligible" | "draft" | "published" | "archived";
  search?: string | null;
  experienceId?: string | null;
  consent?: "pending" | "granted" | "revoked" | null;
  page?: number;
  pageSize?: number;
}): Promise<AdminBookingStoriesPage> {
  const admin = requireAdminClient();
  const page = Math.max(input.page ?? 1, 1);
  const pageSize = Math.min(Math.max(input.pageSize ?? 20, 1), 50);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const [
    eligibleCount,
    draftCount,
    publishedCount,
    archivedCount,
    experiences
  ] = await Promise.all([
    admin
      .from("bookings")
      .select("id,booking_stories!left(id)", { count: "exact", head: true })
      .eq("status", "completed")
      .is("booking_stories.id", null),
    admin
      .from("booking_stories")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    admin
      .from("booking_stories")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    admin
      .from("booking_stories")
      .select("id", { count: "exact", head: true })
      .eq("status", "archived"),
    admin.from("experiences").select("id,title").order("title")
  ]);

  const counts = {
    eligible: eligibleCount.count ?? 0,
    draft: draftCount.count ?? 0,
    published: publishedCount.count ?? 0,
    archived: archivedCount.count ?? 0
  };

  if (input.status === "eligible") {
    let query = admin
      .from("bookings")
      .select(
        "id,experience_id,starts_at_snapshot,completed_at,updated_at,experience_title_snapshot,experiences!inner(title),booking_stories!left(id)",
        { count: "exact" }
      )
      .eq("status", "completed")
      .is("booking_stories.id", null)
      .order("completed_at", { ascending: false })
      .range(from, to);
    if (input.experienceId)
      query = query.eq("experience_id", input.experienceId);
    if (input.search?.trim()) {
      query = query.ilike(
        "experience_title_snapshot",
        `%${input.search.trim()}%`
      );
    }
    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    const items: AdminBookingStorySummary[] = (data ?? []).map((row) => {
      const experience = row.experiences as { title: string };
      return {
        id: row.id,
        bookingId: row.id,
        kind: "eligible",
        title: null,
        experienceId: row.experience_id,
        experienceTitle:
          row.experience_title_snapshot ?? experience.title ?? "Unknown",
        bookingDate: row.starts_at_snapshot ?? row.completed_at,
        guestDisplayName: null,
        mediaCount: 0,
        consentStatus: "not_recorded",
        status: "eligible",
        isFeatured: false,
        updatedAt: row.updated_at
      };
    });
    return {
      items,
      page,
      pageSize,
      total: count ?? 0,
      counts,
      experiences: experiences.data ?? []
    };
  }

  let query = admin
    .from("booking_stories")
    .select(
      "id,booking_id,title,experience_id,guest_display_name,consent_status,status,is_featured,updated_at,experiences!inner(title),bookings!inner(starts_at_snapshot,completed_at),booking_story_media(count)",
      { count: "exact" }
    )
    .eq("status", input.status)
    .order("updated_at", { ascending: false })
    .range(from, to);
  if (input.experienceId) query = query.eq("experience_id", input.experienceId);
  if (input.consent) query = query.eq("consent_status", input.consent);
  if (input.search?.trim()) {
    const search = input.search.trim().replaceAll(",", " ");
    query = query.or(
      `title.ilike.%${search}%,guest_display_name.ilike.%${search}%`
    );
  }
  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  const items: AdminBookingStorySummary[] = (data ?? []).map((row) => {
    const experience = row.experiences as { title: string };
    const booking = row.bookings as {
      starts_at_snapshot: string | null;
      completed_at: string | null;
    };
    const mediaCounts = row.booking_story_media as Array<{ count: number }>;
    return {
      id: row.id,
      bookingId: row.booking_id,
      kind: "story",
      title: row.title,
      experienceId: row.experience_id,
      experienceTitle: experience.title,
      bookingDate: booking.starts_at_snapshot ?? booking.completed_at,
      guestDisplayName: row.guest_display_name,
      mediaCount: mediaCounts[0]?.count ?? 0,
      consentStatus: consentSchema.parse(row.consent_status),
      status: storyStatusSchema.parse(row.status),
      isFeatured: row.is_featured,
      updatedAt: row.updated_at
    };
  });
  return {
    items,
    page,
    pageSize,
    total: count ?? 0,
    counts,
    experiences: experiences.data ?? []
  };
}

export async function getAdminBookingStory(
  storyId: string
): Promise<AdminBookingStoryDetail | null> {
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("booking_stories")
    .select(
      "*,experiences!inner(id,title,slug),bookings!inner(id,status,booking_reference,starts_at_snapshot,completed_at),booking_story_media(*,media_assets!inner(id,bucket_id,storage_path,media_type,mime_type,alt_text,width,height))"
    )
    .eq("id", storyId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const mediaRows = data.booking_story_media as Array<
    StoryMediaRow & {
      media_assets: {
        id: string;
        bucket_id: string;
        storage_path: string;
        media_type: string;
        mime_type: string | null;
        alt_text: string | null;
        width: number | null;
        height: number | null;
      };
    }
  >;
  const footage = mediaRows.filter(
    (row) => row.media_assets.bucket_id === "booking-footage"
  );
  const { data: signed } =
    footage.length > 0
      ? await admin.storage.from("booking-footage").createSignedUrls(
          footage.map((row) => row.media_assets.storage_path),
          3600
        )
      : { data: [] };
  const experience = data.experiences as {
    id: string;
    title: string;
    slug: string;
  };
  const booking = data.bookings as {
    id: string;
    status: string;
    booking_reference: string;
    starts_at_snapshot: string | null;
    completed_at: string | null;
  };
  return {
    story: data,
    experience,
    booking: {
      id: booking.id,
      status: booking.status,
      bookingReference: booking.booking_reference,
      bookingDate: booking.starts_at_snapshot ?? booking.completed_at
    },
    media: footage.map((row, index) => ({
      ...row,
      asset: {
        id: row.media_assets.id,
        bucketId: row.media_assets.bucket_id,
        storagePath: row.media_assets.storage_path,
        mediaType: row.media_assets.media_type,
        mimeType: row.media_assets.mime_type,
        altText: row.media_assets.alt_text,
        width: row.media_assets.width,
        height: row.media_assets.height
      },
      signedUrl: signed?.[index]?.signedUrl ?? null
    }))
  };
}

async function rpc<T>(
  name:
    | "admin_create_booking_story"
    | "admin_update_booking_story"
    | "admin_attach_booking_story_media"
    | "admin_remove_booking_story_media"
    | "admin_set_booking_story_cover"
    | "admin_publish_booking_story"
    | "admin_archive_booking_story",
  args: Record<string, unknown>
): Promise<BookingStoryMutationResult<T>> {
  const client = await createSupabaseServerClient();
  if (!client) return { ok: false, message: "Supabase is not configured" };
  const callRpc = client.rpc.bind(client) as unknown as (
    functionName: string,
    functionArgs: Record<string, unknown>
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
  const { data, error } = await callRpc(name, args);
  if (error) return { ok: false, message: error.message };
  return { ok: true, data: data as T };
}

export const createBookingStory = (args: {
  p_booking_id: string;
  p_title: string;
  p_subtitle?: string;
  p_description?: string;
  p_guest_display_name?: string;
  p_guest_country_code?: string;
  p_guest_quote?: string;
  p_consent_status?: "pending" | "granted" | "revoked";
  p_consent_source?: string;
}) => rpc<StoryRow>("admin_create_booking_story", args);

export const updateBookingStory = (storyId: string, patch: Json) =>
  rpc<StoryRow>("admin_update_booking_story", {
    p_story_id: storyId,
    p_patch: patch
  });

export const attachBookingStoryMedia = (args: {
  p_story_id: string;
  p_media_asset_id: string;
  p_media_role?: "cover" | "gallery" | "highlight" | "video" | "thumbnail";
  p_caption?: string;
  p_display_order?: number;
  p_is_primary?: boolean;
}) => rpc<StoryMediaRow>("admin_attach_booking_story_media", args);

export const removeBookingStoryMedia = (
  storyId: string,
  mediaAssetId: string
) =>
  rpc<void>("admin_remove_booking_story_media", {
    p_story_id: storyId,
    p_media_asset_id: mediaAssetId
  });

export const setBookingStoryCover = (storyId: string, mediaAssetId: string) =>
  rpc<StoryRow>("admin_set_booking_story_cover", {
    p_story_id: storyId,
    p_media_asset_id: mediaAssetId
  });

export const publishBookingStory = (storyId: string) =>
  rpc<StoryRow>("admin_publish_booking_story", { p_story_id: storyId });

export const archiveBookingStory = (storyId: string) =>
  rpc<StoryRow>("admin_archive_booking_story", { p_story_id: storyId });

export async function findBookingFootageAsset(bucket: string, path: string) {
  if (bucket !== "booking-footage") return null;
  const admin = requireAdminClient();
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { data } = await admin
      .from("media_assets")
      .select("id")
      .eq("bucket_id", bucket)
      .eq("storage_path", path)
      .maybeSingle();
    if (data) return data.id;
    await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
  }
  return null;
}

export async function getBookingStoryIdForBooking(
  bookingId: string
): Promise<string | null> {
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("booking_stories")
    .select("id")
    .eq("booking_id", bookingId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

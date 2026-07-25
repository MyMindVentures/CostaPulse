"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  archiveBookingStory,
  attachBookingStoryMedia,
  createBookingStory,
  findBookingFootageAsset,
  publishBookingStory,
  removeBookingStoryMedia,
  setBookingStoryCover,
  updateBookingStory
} from "@/server/repositories/admin-booking-stories";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canMutateAdminContent } from "@/server/auth/role-access";

async function authorize() {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminContent(roles)) throw new Error("Forbidden");
}

const optional = (value: FormDataEntryValue | null) => {
  const text = String(value ?? "").trim();
  return text || null;
};

export async function createBookingStoryAction(formData: FormData) {
  await authorize();
  const parsed = z
    .object({ bookingId: z.string().uuid(), title: z.string().trim().min(1) })
    .safeParse({
      bookingId: formData.get("bookingId"),
      title: formData.get("title")
    });
  if (!parsed.success) return { ok: false as const, message: "Invalid story" };
  const result = await createBookingStory({
    p_booking_id: parsed.data.bookingId,
    p_title: parsed.data.title
  });
  revalidatePath("/admin/booking-stories");
  return result;
}

export async function updateBookingStoryAction(formData: FormData) {
  await authorize();
  const storyId = z.string().uuid().parse(formData.get("storyId"));
  const displayOrder = Number(formData.get("displayOrder") ?? 0);
  const result = await updateBookingStory(storyId, {
    title: String(formData.get("title") ?? "").trim(),
    subtitle: optional(formData.get("subtitle")),
    description: optional(formData.get("description")),
    guest_display_name: optional(formData.get("guestDisplayName")),
    guest_country_code: optional(formData.get("guestCountryCode")),
    guest_quote: optional(formData.get("guestQuote")),
    is_featured: formData.get("featured") === "on",
    display_order:
      Number.isInteger(displayOrder) && displayOrder >= 0 ? displayOrder : 0,
    consent_status: String(formData.get("consentStatus") ?? "pending"),
    consent_source: optional(formData.get("consentSource"))
  });
  revalidatePath(`/admin/booking-stories/${storyId}`);
  revalidatePath("/admin/booking-stories");
  return result;
}

export async function bookingStoryPublicationAction(
  storyId: string,
  action: "publish" | "archive"
) {
  await authorize();
  const id = z.string().uuid().parse(storyId);
  const result =
    action === "publish"
      ? await publishBookingStory(id)
      : await archiveBookingStory(id);
  revalidatePath(`/admin/booking-stories/${id}`);
  revalidatePath("/admin/booking-stories");
  return result;
}

export async function attachUploadedBookingStoryMediaAction(input: {
  storyId: string;
  storagePath: string;
  role: "cover" | "gallery" | "highlight" | "video" | "thumbnail";
  caption?: string;
  displayOrder: number;
}) {
  await authorize();
  const assetId = await findBookingFootageAsset(
    "booking-footage",
    input.storagePath
  );
  if (!assetId)
    return { ok: false as const, message: "Uploaded media was not registered" };
  const result = await attachBookingStoryMedia({
    p_story_id: input.storyId,
    p_media_asset_id: assetId,
    p_media_role: input.role,
    p_caption: input.caption,
    p_display_order: input.displayOrder,
    p_is_primary: input.role === "cover"
  });
  if (result.ok && input.role === "cover") {
    const cover = await setBookingStoryCover(input.storyId, assetId);
    if (!cover.ok) return cover;
  }
  revalidatePath(`/admin/booking-stories/${input.storyId}`);
  return result;
}

export async function updateBookingStoryMediaAction(input: {
  storyId: string;
  mediaAssetId: string;
  role: "cover" | "gallery" | "highlight" | "video" | "thumbnail";
  caption?: string;
  displayOrder: number;
}) {
  await authorize();
  const result = await attachBookingStoryMedia({
    p_story_id: input.storyId,
    p_media_asset_id: input.mediaAssetId,
    p_media_role: input.role,
    p_caption: input.caption,
    p_display_order: input.displayOrder,
    p_is_primary: input.role === "cover"
  });
  if (result.ok && input.role === "cover") {
    const cover = await setBookingStoryCover(input.storyId, input.mediaAssetId);
    if (!cover.ok) return cover;
  }
  revalidatePath(`/admin/booking-stories/${input.storyId}`);
  return result;
}

export async function removeBookingStoryMediaAction(
  storyId: string,
  mediaAssetId: string
) {
  await authorize();
  const result = await removeBookingStoryMedia(storyId, mediaAssetId);
  revalidatePath(`/admin/booking-stories/${storyId}`);
  return result;
}

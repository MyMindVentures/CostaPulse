"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createAdminSignedUpload,
  deleteAdminMedia,
  detachAdminMediaPlacement,
  finalizeAdminMediaUpload,
  linkAdminMediaToScope,
  prepareAdminMediaUpload,
  replaceAdminExperienceCollection,
  replaceAdminMediaPlacement,
  replaceAdminTeamCollection,
  setAdminMediaPrimary,
  upsertAdminAddon,
  upsertAdminExperience,
  upsertAdminLocation,
  upsertAdminMediaAsset,
  upsertAdminPartner,
  upsertAdminTeamMember,
  upsertAdminVariant
} from "@/server/repositories/admin-cms";
import {
  AdminApiError,
  partnerStatusSchema,
  publicationStatusSchema
} from "@/server/admin/schemas";
import {
  MEDIA_ENTITY_TYPES,
  MEDIA_USAGES,
  isMimeAllowedForUsage,
  isUsageAllowed,
  type MediaEntityType,
  type MediaUsage
} from "@/server/media/path-map";
import { requireAreaAccess } from "@/server/auth/protected-area";
import {
  canDeleteAdminMedia,
  canMutateAdminContent,
  canMutateAdminOpsContent
} from "@/server/auth/role-access";
import type { AdminActionResult } from "@/server/admin/actions";

function toActionError(error: unknown): AdminActionResult {
  if (error instanceof AdminApiError) {
    return { ok: false, message: error.message, status: error.status };
  }
  if (error instanceof Error) {
    return { ok: false, message: error.message };
  }
  return { ok: false, message: "Unexpected error" };
}

const experiencePayloadSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(200),
  short_description: z.string().trim().max(500).optional().nullable(),
  description: z.string().trim().max(20000).optional().nullable(),
  location_name: z.string().trim().max(200).optional().nullable(),
  timezone: z.string().trim().min(1).max(64).default("Europe/Madrid"),
  status: publicationStatusSchema.default("draft"),
  hero_image_path: z.string().trim().max(500).optional().nullable(),
  duration_minutes: z.coerce
    .number()
    .int()
    .positive()
    .max(24 * 60),
  base_capacity: z.coerce.number().int().positive().max(500),
  base_currency: z.string().trim().length(3).default("EUR"),
  manual_confirmation_required: z.boolean().default(true),
  experience_type: z
    .enum([
      "paddlesurf_mentor",
      "boat_experience",
      "bbq_experience",
      "kayak_mentor"
    ])
    .optional()
    .nullable(),
  media_folder: z.string().trim().max(120).optional().nullable(),
  mentor_required: z.boolean().default(false),
  highlights: z.array(z.unknown()).default([]),
  inclusions: z.array(z.unknown()).default([]),
  category_label: z.string().trim().max(120).optional().nullable(),
  is_featured: z.boolean().default(false),
  sort_order: z.coerce.number().int().default(0)
});

export async function upsertExperienceAction(
  input: z.infer<typeof experiencePayloadSchema>
): Promise<AdminActionResult & { id?: string }> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  const parsed = experiencePayloadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid experience payload" };
  }

  try {
    const { id, ...payload } = parsed.data;
    const row = (await upsertAdminExperience({
      id,
      payload: {
        ...payload,
        status: id ? payload.status : "draft"
      }
    })) as { id?: string };
    revalidatePath("/admin/experiences");
    if (row.id) revalidatePath(`/admin/experiences/${row.id}`);
    return { ok: true, id: row.id };
  } catch (error) {
    return toActionError(error);
  }
}

export async function publishExperienceAction(input: {
  id: string;
  status: "published" | "draft" | "archived";
}): Promise<AdminActionResult> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  const parsed = z
    .object({
      id: z.string().uuid(),
      status: publicationStatusSchema
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid publish request" };
  }

  try {
    await upsertAdminExperience({
      id: parsed.data.id,
      payload: { status: parsed.data.status }
    });
    revalidatePath("/admin/experiences");
    revalidatePath(`/admin/experiences/${parsed.data.id}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const variantSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  experience_id: z.string().uuid(),
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  pricing_model: z.enum(["per_person", "per_group"]).default("per_person"),
  unit_amount_minor: z.coerce.number().int().nonnegative(),
  currency: z.string().trim().length(3).default("EUR"),
  min_party_size: z.coerce.number().int().positive().default(1),
  max_party_size: z.coerce.number().int().positive().optional().nullable(),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true),
  duration_minutes: z.coerce.number().int().positive().optional().nullable(),
  subtitle: z.string().trim().max(200).optional().nullable(),
  badge_label: z.string().trim().max(80).optional().nullable()
});

export async function upsertVariantAction(
  input: z.infer<typeof variantSchema>
): Promise<AdminActionResult> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  const parsed = variantSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid variant payload" };

  try {
    const { id, ...payload } = parsed.data;
    await upsertAdminVariant({ id, payload });
    revalidatePath(`/admin/experiences/${payload.experience_id}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function replaceExperienceCollectionAction(input: {
  experienceId: string;
  collection: string;
  items: unknown[];
}): Promise<AdminActionResult> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  const parsed = z
    .object({
      experienceId: z.string().uuid(),
      collection: z.enum([
        "itinerary",
        "requirements",
        "policies",
        "languages",
        "locations",
        "team_members"
      ]),
      items: z.array(z.unknown())
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid collection payload" };
  }

  try {
    await replaceAdminExperienceCollection(parsed.data);
    revalidatePath(`/admin/experiences/${parsed.data.experienceId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function upsertAddonAction(input: {
  id?: string | null;
  payload: Record<string, unknown>;
}): Promise<AdminActionResult> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  try {
    await upsertAdminAddon(input);
    const experienceId = String(input.payload.experience_id ?? "");
    if (experienceId) revalidatePath(`/admin/experiences/${experienceId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const locationSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1).max(200),
  short_name: z.string().trim().max(80).optional().nullable(),
  description: z.string().trim().max(5000).optional().nullable(),
  address_line_1: z.string().trim().max(200).optional().nullable(),
  address_line_2: z.string().trim().max(200).optional().nullable(),
  postal_code: z.string().trim().max(32).optional().nullable(),
  city: z.string().trim().min(1).max(120),
  province: z.string().trim().max(120).optional().nullable(),
  country_code: z.string().trim().length(2).default("ES"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  map_zoom: z.coerce.number().int().min(1).max(20).default(13),
  meeting_point_notes: z.string().trim().max(2000).optional().nullable(),
  parking_notes: z.string().trim().max(2000).optional().nullable(),
  is_active: z.boolean().default(true)
});

export async function upsertLocationAction(
  input: z.infer<typeof locationSchema>
): Promise<AdminActionResult & { id?: string }> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminOpsContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  const parsed = locationSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, message: "Invalid location payload" };

  try {
    const { id, ...payload } = parsed.data;
    const row = await upsertAdminLocation({ id, payload });
    revalidatePath("/admin/locations");
    if (row.id) revalidatePath(`/admin/locations/${row.id}`);
    return { ok: true, id: row.id };
  } catch (error) {
    return toActionError(error);
  }
}

const partnerSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1).max(200),
  referral_code: z.string().trim().min(1).max(64).optional(),
  status: partnerStatusSchema.default("draft"),
  attribution_window_hours: z.coerce.number().int().positive().default(720),
  voucher_percent_basis_points: z.coerce
    .number()
    .int()
    .min(0)
    .max(10000)
    .default(1000),
  website_url: z.string().trim().url().optional().nullable().or(z.literal("")),
  business_type: z.string().trim().max(120).optional().nullable(),
  contact_name: z.string().trim().max(200).optional().nullable(),
  phone: z.string().trim().max(64).optional().nullable(),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  address_line_1: z.string().trim().max(200).optional().nullable(),
  address_line_2: z.string().trim().max(200).optional().nullable(),
  postal_code: z.string().trim().max(32).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  province: z.string().trim().max(120).optional().nullable(),
  country_code: z.string().trim().length(2).default("ES")
});

export async function upsertPartnerAction(
  input: z.infer<typeof partnerSchema>
): Promise<AdminActionResult & { id?: string }> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminOpsContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  const parsed = partnerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid partner payload" };

  try {
    const { id, ...payload } = parsed.data;
    const row = await upsertAdminPartner({
      id,
      payload: {
        ...payload,
        website_url: payload.website_url || null,
        email: payload.email || null
      }
    });
    revalidatePath("/admin/partners");
    if (row.id) revalidatePath(`/admin/partners/${row.id}`);
    return { ok: true, id: row.id };
  } catch (error) {
    return toActionError(error);
  }
}

const teamMemberSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  role_title: z.string().trim().min(1).max(120),
  short_bio: z.string().trim().max(500).optional().nullable(),
  bio: z.string().trim().max(10000).optional().nullable(),
  photo_path: z.string().trim().max(500).optional().nullable(),
  photo_alt_text: z.string().trim().max(300).optional().nullable(),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  phone: z.string().trim().max(64).optional().nullable(),
  languages: z.array(z.unknown()).default([]),
  certifications: z.array(z.unknown()).default([]),
  social_links: z.record(z.string(), z.unknown()).default({}),
  display_order: z.coerce.number().int().nonnegative().default(0),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  tagline: z.string().trim().max(200).optional().nullable(),
  home_base: z.string().trim().max(120).optional().nullable(),
  years_experience: z.coerce.number().int().nonnegative().optional().nullable(),
  signature_path: z.string().trim().max(500).optional().nullable(),
  hero_image_path: z.string().trim().max(500).optional().nullable(),
  hobbies: z.array(z.unknown()).default([]),
  seo_title: z.string().trim().max(200).optional().nullable(),
  seo_description: z.string().trim().max(500).optional().nullable()
});

export async function upsertTeamMemberAction(
  input: z.infer<typeof teamMemberSchema>
): Promise<AdminActionResult & { id?: string }> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminOpsContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  const parsed = teamMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid team member payload" };
  }

  try {
    const { id, ...payload } = parsed.data;
    const row = await upsertAdminTeamMember({
      id,
      payload: { ...payload, email: payload.email || null }
    });
    revalidatePath("/admin/team");
    if (row.id) revalidatePath(`/admin/team/${row.id}`);
    return { ok: true, id: row.id };
  } catch (error) {
    return toActionError(error);
  }
}

export async function replaceTeamCollectionAction(input: {
  teamMemberId: string;
  collection: string;
  items: unknown[];
}): Promise<AdminActionResult> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminOpsContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  try {
    await replaceAdminTeamCollection(input);
    revalidatePath(`/admin/team/${input.teamMemberId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function upsertMediaAssetAction(input: {
  id: string;
  payload: Record<string, unknown>;
}): Promise<AdminActionResult> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  const parsed = z
    .object({
      id: z.string().uuid(),
      payload: z.record(z.string(), z.unknown())
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid media payload" };

  try {
    await upsertAdminMediaAsset(parsed.data);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function linkMediaToScopeAction(input: {
  scopeType: string;
  scopeKey: string;
  role: string;
  items: Array<Record<string, unknown>>;
}): Promise<AdminActionResult> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  try {
    await linkAdminMediaToScope(input);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteMediaAction(input: {
  id: string;
  reason?: string;
}): Promise<AdminActionResult> {
  const { roles } = await requireAreaAccess("admin");
  if (!canDeleteAdminMedia(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  try {
    await deleteAdminMedia(input);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function createSignedUploadAction(input: {
  bucket: string;
  path: string;
}): Promise<AdminActionResult & { data?: unknown }> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminOpsContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  const parsed = z
    .object({
      bucket: z.literal("admin-documents"),
      path: z
        .string()
        .trim()
        .min(1)
        .max(500)
        .refine((value) => !value.includes("..") && !value.startsWith("/"), {
          message: "Invalid path"
        })
    })
    .safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message:
        "Only admin-documents signed uploads are allowed from this action"
    };
  }

  try {
    const data = await createAdminSignedUpload(parsed.data);
    return { ok: true, data };
  } catch (error) {
    return toActionError(error);
  }
}

const prepareUploadSchema = z.object({
  entityType: z.enum(MEDIA_ENTITY_TYPES),
  entityId: z.string().uuid(),
  parentEntityId: z.string().uuid().optional().nullable(),
  usage: z.enum(MEDIA_USAGES),
  originalFilename: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(120),
  byteSize: z.number().int().nonnegative().max(30_000_000)
});

export async function prepareMediaUploadAction(
  input: z.infer<typeof prepareUploadSchema>
): Promise<AdminActionResult & { data?: unknown }> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  const parsed = prepareUploadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid upload request" };

  const { entityType, usage, mimeType } = parsed.data;
  if (!isUsageAllowed(entityType as MediaEntityType, usage as MediaUsage)) {
    return { ok: false, message: "Usage not allowed for entity type" };
  }
  if (!isMimeAllowedForUsage(usage as MediaUsage, mimeType)) {
    return { ok: false, message: "File type not allowed for this usage" };
  }
  if (
    parsed.data.entityType === "experience_variant" &&
    !parsed.data.parentEntityId
  ) {
    return { ok: false, message: "Parent experience is required for variants" };
  }

  try {
    const data = await prepareAdminMediaUpload(parsed.data);
    return { ok: true, data };
  } catch (error) {
    return toActionError(error);
  }
}

const finalizeUploadSchema = z.object({
  bucket: z.enum([
    "experience-media",
    "team-media",
    "brand-assets",
    "admin-documents"
  ]),
  storagePath: z.string().trim().min(1).max(500),
  entityType: z.enum(MEDIA_ENTITY_TYPES),
  entityId: z.string().uuid(),
  parentEntityId: z.string().uuid().optional().nullable(),
  usage: z.enum(MEDIA_USAGES),
  originalFilename: z.string().trim().min(1).max(255),
  generatedFilename: z.string().trim().min(1).max(255),
  altText: z.string().trim().max(500).optional().nullable(),
  caption: z.string().trim().max(1000).optional().nullable(),
  displayOrder: z.number().int().min(0).max(10_000).optional(),
  isPrimary: z.boolean().optional(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  durationSeconds: z.number().nonnegative().optional().nullable()
});

export async function finalizeMediaUploadAction(
  input: z.infer<typeof finalizeUploadSchema>
): Promise<AdminActionResult & { data?: unknown }> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  const parsed = finalizeUploadSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, message: "Invalid finalize request" };

  try {
    const data = await finalizeAdminMediaUpload({
      bucket: parsed.data.bucket,
      storagePath: parsed.data.storagePath,
      payload: {
        entity_type: parsed.data.entityType,
        entity_id: parsed.data.entityId,
        parent_entity_id: parsed.data.parentEntityId ?? null,
        usage: parsed.data.usage,
        original_filename: parsed.data.originalFilename,
        generated_filename: parsed.data.generatedFilename,
        alt_text: parsed.data.altText ?? null,
        caption: parsed.data.caption ?? null,
        display_order: parsed.data.displayOrder ?? 0,
        is_primary: parsed.data.isPrimary ?? false,
        width: parsed.data.width ?? null,
        height: parsed.data.height ?? null,
        duration_seconds: parsed.data.durationSeconds ?? null,
        folder_path: parsed.data.storagePath.split("/").slice(0, -1).join("/")
      }
    });
    revalidatePath("/admin/media");
    revalidatePath("/admin/experiences");
    revalidatePath("/admin/team");
    revalidatePath("/admin/partners");
    revalidatePath("/admin/locations");
    return { ok: true, data };
  } catch (error) {
    return toActionError(error);
  }
}

export async function detachMediaPlacementAction(input: {
  placementId: string;
}): Promise<AdminActionResult> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  const parsed = z.object({ placementId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid placement" };
  try {
    await detachAdminMediaPlacement(parsed.data);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function setMediaPrimaryAction(input: {
  placementId: string;
}): Promise<AdminActionResult> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  const parsed = z.object({ placementId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid placement" };
  try {
    await setAdminMediaPrimary(parsed.data);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function replaceMediaPlacementAction(input: {
  placementId: string;
  bucket:
    | "experience-media"
    | "team-media"
    | "brand-assets"
    | "admin-documents";
  storagePath: string;
  originalFilename: string;
  generatedFilename: string;
  altText?: string | null;
  caption?: string | null;
}): Promise<AdminActionResult> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminContent(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }
  const parsed = z
    .object({
      placementId: z.string().uuid(),
      bucket: z.enum([
        "experience-media",
        "team-media",
        "brand-assets",
        "admin-documents"
      ]),
      storagePath: z.string().min(1),
      originalFilename: z.string().min(1),
      generatedFilename: z.string().min(1),
      altText: z.string().nullable().optional(),
      caption: z.string().nullable().optional()
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid replace payload" };
  }
  try {
    const data = await replaceAdminMediaPlacement({
      placementId: parsed.data.placementId,
      bucket: parsed.data.bucket,
      storagePath: parsed.data.storagePath,
      payload: {
        original_filename: parsed.data.originalFilename,
        generated_filename: parsed.data.generatedFilename,
        alt_text: parsed.data.altText ?? null,
        caption: parsed.data.caption ?? null
      }
    });
    revalidatePath("/admin/media");
    revalidatePath("/admin/experiences");
    revalidatePath("/admin/team");
    revalidatePath("/admin/partners");
    revalidatePath("/admin/locations");
    return { ok: true, data };
  } catch (error) {
    return toActionError(error);
  }
}

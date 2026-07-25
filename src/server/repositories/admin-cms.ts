import "server-only";

import { z } from "zod";
import { callAdminApi } from "@/server/admin/api-client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  adminExperienceDetailSchema,
  adminExperienceListSchema,
  adminLocationSchema,
  adminMediaAssetSchema,
  adminMediaListSchema,
  adminPartnerDetailSchema,
  adminPartnerSchema,
  adminTeamMemberSchema,
  finalizedMediaUploadSchema,
  preparedMediaUploadSchema,
  publicationStatusSchema,
  signedUploadSchema,
  type AdminExperienceDetail,
  type AdminExperienceHealth,
  type AdminLocation,
  type AdminMediaAsset,
  type AdminMediaList,
  type AdminPartner,
  type AdminPartnerDetail,
  type AdminTeamMember
} from "@/server/admin/schemas";

export async function fetchAdminExperiences(input?: {
  search?: string | null;
  status?: z.infer<typeof publicationStatusSchema> | null;
}): Promise<AdminExperienceHealth[]> {
  return callAdminApi({
    body: {
      action: "list_experiences",
      search: input?.search ?? null,
      status: input?.status ?? null
    },
    schema: adminExperienceListSchema
  });
}

export async function fetchAdminExperienceDetail(
  experienceId: string
): Promise<AdminExperienceDetail> {
  return callAdminApi({
    body: { action: "experience_detail", experience_id: experienceId },
    schema: adminExperienceDetailSchema
  });
}

export async function upsertAdminExperience(input: {
  id?: string | null;
  payload: Record<string, unknown>;
}) {
  return callAdminApi({
    body: {
      action: "upsert_experience",
      id: input.id ?? null,
      payload: input.payload
    },
    schema: z.record(z.string(), z.unknown())
  });
}

export async function upsertAdminVariant(input: {
  id?: string | null;
  payload: Record<string, unknown>;
}) {
  return callAdminApi({
    body: {
      action: "upsert_variant",
      id: input.id ?? null,
      payload: input.payload
    },
    schema: z.record(z.string(), z.unknown())
  });
}

export async function replaceAdminExperienceCollection(input: {
  experienceId: string;
  collection: string;
  items: unknown[];
}) {
  return callAdminApi({
    body: {
      action: "replace_experience_collection",
      experience_id: input.experienceId,
      collection: input.collection,
      items: input.items
    },
    schema: z.array(z.record(z.string(), z.unknown()))
  });
}

export async function upsertAdminAddon(input: {
  id?: string | null;
  payload: Record<string, unknown>;
}) {
  return callAdminApi({
    body: {
      action: "upsert_addon",
      id: input.id ?? null,
      payload: input.payload
    },
    schema: z.record(z.string(), z.unknown())
  });
}

export async function fetchAdminLocations(): Promise<AdminLocation[]> {
  return callAdminApi({
    body: { action: "list_locations" },
    schema: z.array(adminLocationSchema)
  });
}

export async function upsertAdminLocation(input: {
  id?: string | null;
  payload: Record<string, unknown>;
}) {
  return callAdminApi({
    body: {
      action: "upsert_location",
      id: input.id ?? null,
      payload: input.payload
    },
    schema: adminLocationSchema
  });
}

export async function fetchAdminPartners(): Promise<AdminPartner[]> {
  return callAdminApi({
    body: { action: "list_partners" },
    schema: z.array(adminPartnerSchema)
  });
}

export async function fetchPartnerOwnerProfiles() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin client is not configured.");
  const { data: roleRows, error: roleError } = await supabase
    .from("user_roles")
    .select("profile_id")
    .eq("role", "partner");
  if (roleError) throw new Error(roleError.message);
  const ids = [...new Set((roleRows ?? []).map((row) => row.profile_id))];
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .in("id", ids)
    .order("display_name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchAdminPartnerDetail(
  partnerId: string
): Promise<AdminPartnerDetail> {
  return callAdminApi({
    body: { action: "partner_detail", partner_id: partnerId },
    schema: adminPartnerDetailSchema
  });
}

export async function upsertAdminPartner(input: {
  id?: string | null;
  payload: Record<string, unknown>;
}) {
  return callAdminApi({
    body: {
      action: "upsert_partner",
      id: input.id ?? null,
      payload: input.payload
    },
    schema: adminPartnerSchema
  });
}

export async function fetchAdminTeamMembers(): Promise<AdminTeamMember[]> {
  return callAdminApi({
    body: { action: "list_team_members" },
    schema: z.array(adminTeamMemberSchema)
  });
}

export async function fetchAdminTeamMemberDetail(teamMemberId: string) {
  return callAdminApi({
    body: { action: "team_member_detail", team_member_id: teamMemberId },
    schema: z.record(z.string(), z.unknown())
  });
}

export async function upsertAdminTeamMember(input: {
  id?: string | null;
  payload: Record<string, unknown>;
}) {
  return callAdminApi({
    body: {
      action: "upsert_team_member",
      id: input.id ?? null,
      payload: input.payload
    },
    schema: adminTeamMemberSchema
  });
}

export async function replaceAdminTeamCollection(input: {
  teamMemberId: string;
  collection: string;
  items: unknown[];
}) {
  return callAdminApi({
    body: {
      action: "replace_team_collection",
      team_member_id: input.teamMemberId,
      collection: input.collection,
      items: input.items
    },
    schema: z.array(z.record(z.string(), z.unknown()))
  });
}

export async function fetchAdminMedia(input?: {
  search?: string | null;
  mediaType?: string | null;
  usage?: string | null;
  scopeType?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  placementUsage?: string | null;
  mimeType?: string | null;
  page?: number;
  pageSize?: number;
}): Promise<AdminMediaList> {
  return callAdminApi({
    body: {
      action: "list_media",
      search: input?.search ?? null,
      media_type: input?.mediaType ?? null,
      usage: input?.usage ?? null,
      scope_type: input?.scopeType ?? input?.entityType ?? null,
      entity_type: input?.entityType ?? null,
      entity_id: input?.entityId ?? null,
      placement_usage: input?.placementUsage ?? null,
      mime_type: input?.mimeType ?? null,
      page: input?.page ?? 1,
      page_size: input?.pageSize ?? 24
    },
    schema: adminMediaListSchema
  });
}

export async function upsertAdminMediaAsset(input: {
  id: string;
  payload: Record<string, unknown>;
}): Promise<AdminMediaAsset> {
  return callAdminApi({
    body: {
      action: "upsert_media_asset",
      id: input.id,
      payload: input.payload
    },
    schema: adminMediaAssetSchema
  });
}

export async function linkAdminMediaToScope(input: {
  scopeType: string;
  scopeKey: string;
  role: string;
  items: Array<Record<string, unknown>>;
}) {
  return callAdminApi({
    body: {
      action: "link_media_to_scope",
      scope_type: input.scopeType,
      scope_key: input.scopeKey,
      role: input.role,
      items: input.items
    },
    schema: z.array(z.record(z.string(), z.unknown()))
  });
}

export async function deleteAdminMedia(input: {
  id: string;
  reason?: string | null;
}) {
  return callAdminApi({
    body: {
      action: "delete_media",
      id: input.id,
      reason: input.reason ?? null
    },
    schema: z.boolean()
  });
}

export async function createAdminSignedUpload(input: {
  bucket: string;
  path: string;
}) {
  return callAdminApi({
    body: {
      action: "create_signed_upload",
      bucket: input.bucket,
      path: input.path
    },
    schema: signedUploadSchema
  });
}

export async function prepareAdminMediaUpload(input: {
  entityType: string;
  entityId: string;
  parentEntityId?: string | null;
  usage: string;
  originalFilename: string;
  mimeType: string;
  byteSize: number;
}) {
  return callAdminApi({
    body: {
      action: "prepare_media_upload",
      entity_type: input.entityType,
      entity_id: input.entityId,
      parent_entity_id: input.parentEntityId ?? null,
      usage: input.usage,
      original_filename: input.originalFilename,
      mime_type: input.mimeType,
      byte_size: input.byteSize
    },
    schema: preparedMediaUploadSchema
  });
}

export async function finalizeAdminMediaUpload(input: {
  bucket: string;
  storagePath: string;
  payload: Record<string, unknown>;
}) {
  return callAdminApi({
    body: {
      action: "finalize_media_upload",
      bucket: input.bucket,
      storage_path: input.storagePath,
      payload: input.payload
    },
    schema: finalizedMediaUploadSchema
  });
}

export async function replaceAdminMediaPlacement(input: {
  placementId: string;
  bucket: string;
  storagePath: string;
  payload: Record<string, unknown>;
}) {
  return callAdminApi({
    body: {
      action: "replace_media_placement",
      placement_id: input.placementId,
      bucket: input.bucket,
      storage_path: input.storagePath,
      payload: input.payload
    },
    schema: finalizedMediaUploadSchema
  });
}

export async function detachAdminMediaPlacement(input: {
  placementId: string;
}) {
  return callAdminApi({
    body: {
      action: "detach_media_placement",
      placement_id: input.placementId
    },
    schema: z.boolean()
  });
}

export async function setAdminMediaPrimary(input: { placementId: string }) {
  return callAdminApi({
    body: {
      action: "set_media_primary",
      placement_id: input.placementId
    },
    schema: z.record(z.string(), z.unknown())
  });
}

export async function deleteAdminEntity(input: {
  entityType: string;
  entityId: string;
  reason?: string | null;
}) {
  return callAdminApi({
    body: {
      action: "delete_entity",
      entity_type: input.entityType,
      entity_id: input.entityId,
      reason: input.reason ?? null
    },
    schema: z.boolean()
  });
}

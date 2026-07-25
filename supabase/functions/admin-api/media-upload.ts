import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type AdminClient = ReturnType<typeof createClient>;

const ENTITY_USAGE: Record<string, string[]> = {
  experience: ["hero", "gallery", "card_thumbnail", "background", "footage"],
  experience_variant: [
    "hero",
    "gallery",
    "card_thumbnail",
    "background",
    "footage"
  ],
  location: ["gallery", "card_thumbnail", "background"],
  team_member: ["avatar", "hero", "gallery"],
  partner: ["logo", "gallery", "document"],
  site_content: ["logo", "background", "hero", "qr_flyer", "document"]
};

const IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif"
]);
const VIDEO_MIME = new Set(["video/mp4", "video/webm"]);
const DOCUMENT_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

function slugifySegment(value: string): string {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "asset"
  );
}

function extensionFromMime(mimeType: string, originalFilename: string): string {
  const fromName = originalFilename.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{1,8}$/.test(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "application/pdf": "pdf"
  };
  return map[mimeType] ?? "bin";
}

function mimeAllowed(usage: string, mimeType: string): boolean {
  if (usage === "footage") return VIDEO_MIME.has(mimeType);
  if (usage === "document" || usage === "qr_flyer") {
    return DOCUMENT_MIME.has(mimeType) || IMAGE_MIME.has(mimeType);
  }
  if (usage === "logo" || usage === "avatar") return IMAGE_MIME.has(mimeType);
  return IMAGE_MIME.has(mimeType) || VIDEO_MIME.has(mimeType);
}

export async function prepareMediaUpload(
  admin: AdminClient,
  body: Record<string, unknown>
) {
  const entityType = String(body.entity_type ?? "");
  const entityId = String(body.entity_id ?? "");
  const parentEntityId = body.parent_entity_id
    ? String(body.parent_entity_id)
    : null;
  const usage = String(body.usage ?? "");
  const originalFilename = String(body.original_filename ?? "upload.bin");
  const mimeType = String(body.mime_type ?? "application/octet-stream");
  const byteSize = Number(body.byte_size ?? 0);

  if (!ENTITY_USAGE[entityType]?.includes(usage)) {
    throw new Error(`Usage ${usage} is not allowed for ${entityType}`);
  }
  if (!mimeAllowed(usage, mimeType)) {
    throw new Error(`MIME type ${mimeType} is not allowed for ${usage}`);
  }
  if (!entityId) throw new Error("entity_id is required");

  let entitySlug = "";
  let parentSlug: string | null = null;
  let sectionKey: string | null = null;

  let resolvedParentId = parentEntityId;

  if (entityType === "experience") {
    const { data, error } = await admin
      .from("experiences")
      .select("id, slug")
      .eq("id", entityId)
      .maybeSingle();
    if (error || !data) throw new Error("Experience not found");
    entitySlug = data.slug;
  } else if (entityType === "experience_variant") {
    const { data, error } = await admin
      .from("experience_variants")
      .select("id, slug, experience_id, experiences!inner(slug)")
      .eq("id", entityId)
      .maybeSingle();
    if (error || !data) throw new Error("Experience variant not found");
    if (parentEntityId && data.experience_id !== parentEntityId) {
      throw new Error("Variant does not belong to the selected experience");
    }
    resolvedParentId = data.experience_id;
    entitySlug = data.slug;
    const exp = data.experiences as
      | { slug?: string }
      | { slug?: string }[]
      | null;
    parentSlug = Array.isArray(exp)
      ? (exp[0]?.slug ?? null)
      : (exp?.slug ?? null);
  } else if (entityType === "location") {
    const { data, error } = await admin
      .from("locations")
      .select("id, slug")
      .eq("id", entityId)
      .maybeSingle();
    if (error || !data) throw new Error("Location not found");
    entitySlug = data.slug;
  } else if (entityType === "team_member") {
    const { data, error } = await admin
      .from("team_members")
      .select("id, slug")
      .eq("id", entityId)
      .maybeSingle();
    if (error || !data) throw new Error("Team member not found");
    entitySlug = data.slug;
  } else if (entityType === "partner") {
    const { data, error } = await admin
      .from("partners")
      .select("id, slug")
      .eq("id", entityId)
      .maybeSingle();
    if (error || !data) throw new Error("Partner not found");
    entitySlug = data.slug;
  } else if (entityType === "site_content") {
    const { data, error } = await admin
      .from("site_content_sections")
      .select("id, section_key")
      .eq("id", entityId)
      .maybeSingle();
    if (error || !data) throw new Error("Site content section not found");
    entitySlug = data.section_key;
    sectionKey = data.section_key;
  } else {
    throw new Error("Unsupported entity type");
  }

  const safeSlug = slugifySegment(entitySlug);
  const suffix = slugifySegment(
    `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`
  );
  const ext = extensionFromMime(mimeType, originalFilename);
  const generatedFilename = `${safeSlug}-${usage}-${suffix}.${ext}`;

  let bucket = "experience-media";
  let folder = `${safeSlug}/${usage}`;
  let humanLabel = `experiences/${safeSlug}/${usage}/`;

  if (entityType === "experience_variant") {
    const parent = slugifySegment(parentSlug ?? "experience");
    folder = `${parent}/variants/${safeSlug}/${usage}`;
    humanLabel = `experiences/${parent}/variants/${safeSlug}/${usage}/`;
  } else if (entityType === "location") {
    bucket = "brand-assets";
    folder = `locations/${safeSlug}/${usage}`;
    humanLabel = folder + "/";
  } else if (entityType === "team_member") {
    bucket = "team-media";
    folder = `${safeSlug}/${usage}`;
    humanLabel = `team/${safeSlug}/${usage}/`;
  } else if (entityType === "partner") {
    bucket = "brand-assets";
    folder = `partners/${safeSlug}/${usage}`;
    humanLabel = folder + "/";
  } else if (entityType === "site_content") {
    bucket = "brand-assets";
    const section = slugifySegment(sectionKey ?? safeSlug);
    folder = `site/${section}/${usage}`;
    humanLabel = folder + "/";
  }

  const limits: Record<string, number> = {
    "experience-media": 15_728_640,
    "team-media": 15_728_640,
    "brand-assets": 20_971_520,
    "admin-documents": 26_214_400
  };
  if (byteSize > 0 && byteSize > (limits[bucket] ?? 15_728_640)) {
    throw new Error("File exceeds maximum size for destination bucket");
  }

  const storagePath = `${folder}/${generatedFilename}`;
  if (storagePath.includes("..") || storagePath.startsWith("/")) {
    throw new Error("Invalid storage path");
  }

  return {
    bucket,
    folder,
    storagePath,
    generatedFilename,
    humanLabel,
    originalFilename,
    mimeType,
    entityType,
    entityId,
    parentEntityId:
      entityType === "experience_variant" ? resolvedParentId : null,
    usage
  };
}

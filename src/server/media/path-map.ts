/**
 * Server-authoritative media destination mapping.
 * The Edge Function is the upload authority; this module mirrors the rules
 * for Next.js validation, destination previews, and unit tests.
 */

export const MEDIA_ENTITY_TYPES = [
  "experience",
  "experience_variant",
  "location",
  "team_member",
  "partner",
  "site_content"
] as const;

export type MediaEntityType = (typeof MEDIA_ENTITY_TYPES)[number];

export const MEDIA_USAGES = [
  "hero",
  "gallery",
  "card_thumbnail",
  "background",
  "footage",
  "logo",
  "avatar",
  "qr_flyer",
  "document"
] as const;

export type MediaUsage = (typeof MEDIA_USAGES)[number];

export const MEDIA_BUCKETS = [
  "experience-media",
  "team-media",
  "brand-assets",
  "admin-documents"
] as const;

export type MediaBucket = (typeof MEDIA_BUCKETS)[number];

const ENTITY_USAGE_ALLOW: Record<MediaEntityType, readonly MediaUsage[]> = {
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

export function usagesForEntity(entityType: MediaEntityType): MediaUsage[] {
  return [...ENTITY_USAGE_ALLOW[entityType]];
}

export function isUsageAllowed(
  entityType: MediaEntityType,
  usage: MediaUsage
): boolean {
  return ENTITY_USAGE_ALLOW[entityType].includes(usage);
}

export function slugifySegment(value: string): string {
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

export function extensionFromMimeOrName(
  mimeType: string,
  originalFilename: string
): string {
  const fromName = originalFilename.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{1,8}$/.test(fromName)) {
    if (fromName === "jpeg") return "jpg";
    return fromName;
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

export function isMimeAllowedForUsage(
  usage: MediaUsage,
  mimeType: string
): boolean {
  if (usage === "footage") return VIDEO_MIME.has(mimeType);
  if (usage === "document" || usage === "qr_flyer") {
    return DOCUMENT_MIME.has(mimeType) || IMAGE_MIME.has(mimeType);
  }
  if (usage === "logo" || usage === "avatar") return IMAGE_MIME.has(mimeType);
  return IMAGE_MIME.has(mimeType) || VIDEO_MIME.has(mimeType);
}

export type DestinationInput = {
  entityType: MediaEntityType;
  usage: MediaUsage;
  entitySlug: string;
  parentSlug?: string | null;
  sectionKey?: string | null;
  originalFilename: string;
  mimeType: string;
  uniqueSuffix?: string;
};

export type MediaDestination = {
  bucket: MediaBucket;
  folder: string;
  generatedFilename: string;
  storagePath: string;
  humanLabel: string;
};

export function resolveMediaDestination(
  input: DestinationInput
): MediaDestination {
  if (!isUsageAllowed(input.entityType, input.usage)) {
    throw new Error(
      `Usage "${input.usage}" is not allowed for entity type "${input.entityType}"`
    );
  }
  if (!isMimeAllowedForUsage(input.usage, input.mimeType)) {
    throw new Error(
      `MIME type "${input.mimeType}" is not allowed for ${input.usage}`
    );
  }

  const entitySlug = slugifySegment(input.entitySlug);
  const usage = input.usage;
  const suffix = slugifySegment(
    input.uniqueSuffix ??
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  );
  const ext = extensionFromMimeOrName(input.mimeType, input.originalFilename);
  const generatedFilename = `${entitySlug}-${usage}-${suffix}.${ext}`;

  let bucket: MediaBucket;
  let folder: string;
  let humanLabel: string;

  switch (input.entityType) {
    case "experience":
      bucket = "experience-media";
      folder = `${entitySlug}/${usage}`;
      humanLabel = `experiences/${entitySlug}/${usage}/`;
      break;
    case "experience_variant": {
      const parent = slugifySegment(input.parentSlug ?? "experience");
      bucket = "experience-media";
      folder = `${parent}/variants/${entitySlug}/${usage}`;
      humanLabel = `experiences/${parent}/variants/${entitySlug}/${usage}/`;
      break;
    }
    case "location":
      bucket = "brand-assets";
      folder = `locations/${entitySlug}/${usage}`;
      humanLabel = `locations/${entitySlug}/${usage}/`;
      break;
    case "team_member":
      bucket = "team-media";
      folder = `${entitySlug}/${usage}`;
      humanLabel = `team/${entitySlug}/${usage}/`;
      break;
    case "partner":
      bucket = "brand-assets";
      folder = `partners/${entitySlug}/${usage}`;
      humanLabel = `partners/${entitySlug}/${usage}/`;
      break;
    case "site_content": {
      const section = slugifySegment(input.sectionKey ?? entitySlug);
      if (usage === "document") {
        bucket = "brand-assets";
        folder = `site/${section}/${usage}`;
      } else {
        bucket = "brand-assets";
        folder = `site/${section}/${usage}`;
      }
      humanLabel = `site/${section}/${usage}/`;
      break;
    }
    default: {
      const _exhaustive: never = input.entityType;
      throw new Error(`Unsupported entity type: ${_exhaustive}`);
    }
  }

  if (folder.includes("..") || folder.startsWith("/")) {
    throw new Error("Invalid storage folder");
  }

  return {
    bucket,
    folder,
    generatedFilename,
    storagePath: `${folder}/${generatedFilename}`,
    humanLabel
  };
}

export function detectMimeFromMagic(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  // ftyp....avif / mp4 / webm
  if (
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    if (brand.startsWith("avif") || brand.startsWith("avis"))
      return "image/avif";
    if (
      brand.startsWith("isom") ||
      brand.startsWith("mp41") ||
      brand.startsWith("mp42") ||
      brand.startsWith("iso2")
    ) {
      return "video/mp4";
    }
  }
  if (
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return "video/webm";
  }
  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return "application/pdf";
  }
  return null;
}

export const BUCKET_SIZE_LIMITS: Record<MediaBucket, number> = {
  "experience-media": 15_728_640,
  "team-media": 15_728_640,
  "brand-assets": 20_971_520,
  "admin-documents": 26_214_400
};

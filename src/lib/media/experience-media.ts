export const EXPERIENCE_MEDIA_BUCKET = "experience-media";
export const BRAND_ASSETS_BUCKET = "brand-assets";
export const SITE_LOGO_FALLBACK_SRC = "/brand/costapulse-mark.svg";

/**
 * Builds a public Supabase Storage URL from a bucket id and object path.
 */
export function getPublicStorageUrl(
  bucket: string | null | undefined,
  path: string | null | undefined,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
): string | null {
  if (!bucket || !path || !supabaseUrl) {
    return null;
  }

  const normalizedBucket = bucket.replace(/^\/+|\/+$/g, "");
  const normalizedPath = path.replace(/^\/+/, "");
  if (!normalizedBucket || !normalizedPath) {
    return null;
  }

  const base = supabaseUrl.replace(/\/+$/, "");
  const encodedPath = normalizedPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/storage/v1/object/public/${encodeURIComponent(normalizedBucket)}/${encodedPath}`;
}

/**
 * Builds a public Supabase Storage URL from an object path in the experience-media bucket.
 * Paths are stored on experiences.hero_image_path (not full URLs).
 */
export function getExperienceMediaUrl(
  path: string | null | undefined,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
): string | null {
  return getPublicStorageUrl(EXPERIENCE_MEDIA_BUCKET, path, supabaseUrl);
}

export function getExperienceHeroImageSrc(
  heroImagePath: string | null | undefined,
  fallbackSrc?: string | null
): string | null {
  return getExperienceMediaUrl(heroImagePath) ?? fallbackSrc ?? null;
}

const MEDIA_PROBE_TIMEOUT_MS = 1500;

/**
 * Prefer a live Storage object when present.
 * For published experience cards, omit fallbackSrc so missing media yields null (CSS fallback).
 * Curated empty-state tiles may still pass an interim fallbackSrc.
 */
export async function resolvePublicImageSrc(
  path: string | null | undefined,
  fallbackSrc?: string | null,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
): Promise<string | null> {
  const storageUrl = getExperienceMediaUrl(path, supabaseUrl);
  if (storageUrl) {
    try {
      // Use GET with a Range header — Node HEAD against Supabase Storage is unreliable.
      const response = await fetch(storageUrl, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        signal: AbortSignal.timeout(MEDIA_PROBE_TIMEOUT_MS),
        next: { revalidate: 300 }
      });
      if (response.ok || response.status === 206) {
        return storageUrl;
      }
    } catch {
      // Storage miss, timeout, or network issue — fall through.
    }
  }

  return fallbackSrc ?? null;
}

export type MediaAssetRef = {
  bucketId: string;
  storagePath: string;
};

/**
 * Prefer a linked media_assets row; fall back to experience-media path.
 */
export function resolveExperienceMediaUrl(
  storagePath: string | null | undefined,
  mediaAsset?: MediaAssetRef | null,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
): string | null {
  if (mediaAsset?.bucketId && mediaAsset.storagePath) {
    return getPublicStorageUrl(mediaAsset.bucketId, mediaAsset.storagePath, supabaseUrl);
  }
  return getExperienceMediaUrl(storagePath, supabaseUrl);
}

export type SiteLogoCandidate = {
  bucketId: string;
  storagePath: string;
};

/**
 * Picks the site logo asset from catalogued brand-assets under logos/.
 * Prefers an exact CostaPulse Logo.png match when present.
 */
export function selectSiteLogoAsset(
  assets: SiteLogoCandidate[]
): SiteLogoCandidate | null {
  const logos = assets.filter(
    (asset) =>
      asset.bucketId === BRAND_ASSETS_BUCKET &&
      asset.storagePath.startsWith("logos/") &&
      !asset.storagePath.endsWith(".keep") &&
      asset.storagePath !== "logos/.keep"
  );

  if (logos.length === 0) {
    return null;
  }

  const preferred = logos.find(
    (asset) => asset.storagePath.toLowerCase() === "logos/costapulse logo.png"
  );
  return preferred ?? logos.sort((a, b) => a.storagePath.localeCompare(b.storagePath))[0] ?? null;
}

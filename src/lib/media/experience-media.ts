export const EXPERIENCE_MEDIA_BUCKET = "experience-media";

/**
 * Builds a public Supabase Storage URL from an object path.
 * Paths are stored on experiences.hero_image_path (not full URLs).
 */
export function getExperienceMediaUrl(
  path: string | null | undefined,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
): string | null {
  if (!path || !supabaseUrl) {
    return null;
  }

  const normalizedPath = path.replace(/^\/+/, "");
  if (!normalizedPath) {
    return null;
  }

  const base = supabaseUrl.replace(/\/+$/, "");
  return `${base}/storage/v1/object/public/${EXPERIENCE_MEDIA_BUCKET}/${normalizedPath}`;
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

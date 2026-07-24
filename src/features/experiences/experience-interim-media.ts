/**
 * @deprecated Interim remote image fallbacks were removed.
 * Card heroes must resolve only from Supabase Storage paths.
 */
export function getExperienceInterimImageSrc(
  _slug: string | null | undefined
): string | null {
  return null;
}

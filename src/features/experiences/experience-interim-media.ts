/**
 * Interim photography for published experience cards until Storage heroes exist.
 * Upload `{media_folder}/hero.webp` (or update hero_image_path) to replace these.
 */
export const EXPERIENCE_INTERIM_MEDIA_BY_SLUG = {
  "boat-experience":
    "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1400&q=80",
  "paddlesurf-mentor":
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1400&q=80",
  "kayak-mentor":
    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1400&q=80",
  "bbq-experience":
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80"
} as const;

export type ExperienceInterimMediaSlug =
  keyof typeof EXPERIENCE_INTERIM_MEDIA_BY_SLUG;

export function getExperienceInterimImageSrc(
  slug: string
): string | null {
  if (slug in EXPERIENCE_INTERIM_MEDIA_BY_SLUG) {
    return EXPERIENCE_INTERIM_MEDIA_BY_SLUG[
      slug as ExperienceInterimMediaSlug
    ];
  }
  return null;
}

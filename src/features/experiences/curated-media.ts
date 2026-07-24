/**
 * Curated home tiles until published experiences exist.
 * Upload matching files to the `experience-media` bucket to replace interim photography:
 *   curated/private-charters.webp
 *   curated/coastal-adventures.webp
 *   curated/local-hospitality.webp
 */
export const CURATED_MEDIA_BY_SLUG = {
  "private-charters": {
    imagePath: "curated/private-charters.webp",
    interimImageSrc:
      "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1400&q=80"
  },
  "coastal-adventures": {
    imagePath: "curated/coastal-adventures.webp",
    interimImageSrc:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1400&q=80"
  },
  "local-hospitality": {
    imagePath: "curated/local-hospitality.webp",
    interimImageSrc:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80"
  }
} as const;

export type CuratedMediaSlug = keyof typeof CURATED_MEDIA_BY_SLUG;

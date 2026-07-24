/**
 * Curated home tiles until published experiences exist.
 * Image paths resolve from the `experience-media` bucket only — no remote interim URLs.
 */
export const CURATED_MEDIA_BY_SLUG = {
  "private-charters": {
    imagePath: "curated/private-charters.webp"
  },
  "coastal-adventures": {
    imagePath: "curated/coastal-adventures.webp"
  },
  "local-hospitality": {
    imagePath: "curated/local-hospitality.webp"
  }
} as const;

export type CuratedMediaSlug = keyof typeof CURATED_MEDIA_BY_SLUG;

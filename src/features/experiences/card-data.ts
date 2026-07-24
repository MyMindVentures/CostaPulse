export type ExperienceMediaCandidate = {
  storagePath: string;
  mediaType: string;
  altText: string | null;
  isHero: boolean;
  displayOrder: number;
};

export type ResolvedHeroMedia = {
  path: string | null;
  altText: string | null;
};

/**
 * Prefer an is_hero image from experience_media, else experiences.hero_image_path.
 */
export function resolveHeroMedia(
  media: ExperienceMediaCandidate[],
  fallbackHeroPath: string | null | undefined
): ResolvedHeroMedia {
  const hero = [...media]
    .filter((item) => item.isHero && item.mediaType === "image")
    .sort((a, b) => a.displayOrder - b.displayOrder)[0];

  if (hero) {
    return {
      path: hero.storagePath,
      altText: hero.altText
    };
  }

  const fallback = fallbackHeroPath?.trim() ? fallbackHeroPath : null;
  return {
    path: fallback,
    altText: null
  };
}

export type ReviewRatingCandidate = {
  rating: number;
  status: string;
};

export type PublishedRatingSummary = {
  averageRating: number | null;
  reviewCount: number;
};

/**
 * Aggregate published reviews only. Never invent ratings when count is zero.
 */
export function aggregatePublishedRatings(
  reviews: ReviewRatingCandidate[]
): PublishedRatingSummary {
  const published = reviews.filter((review) => review.status === "published");
  if (published.length === 0) {
    return { averageRating: null, reviewCount: 0 };
  }

  const sum = published.reduce((total, review) => total + review.rating, 0);
  const averageRating = Math.round((sum / published.length) * 10) / 10;

  return {
    averageRating,
    reviewCount: published.length
  };
}

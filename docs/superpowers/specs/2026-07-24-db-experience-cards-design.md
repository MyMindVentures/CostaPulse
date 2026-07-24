# DB-backed Experience Cards — Design

**Date:** 2026-07-24  
**Status:** Approved

## Goal

The reusable `ExperienceTile` renders published listing data from Supabase and hero still images from the `experience-media` Storage bucket. Missing bucket media uses the CSS visual fallback only—no Unsplash or interim stock photography for real experience cards.

## Locked decisions

1. Missing bucket image → CSS fallback only (no Unsplash).
2. Hero path precedence: `experience_media` where `is_hero = true` and `media_type = 'image'` → `experiences.hero_image_path` → null.
3. Ratings from published `reviews` only; hide the rating row when `reviewCount === 0`.
4. Card media is still images only (video deferred to detail pages).

## Architecture

Enrich `getPublishedExperienceCards` to join hero media and published review aggregates. Resolve public Storage URLs server-side. Keep `ExperienceTile` presentational. Home formats i18n labels and maps the catalog contract into tile props.

```text
experiences + variants + experience_media + reviews
  → getPublishedExperienceCards
  → resolvePublicImageSrc (probe Storage; null on miss)
  → HomePageFeature
  → ExperienceTile
```

## Backend contract (`ExperienceCard`)

Existing fields remain. Add:

- `heroImagePath: string | null` — resolved storage path (media hero or column)
- `heroImageAlt: string | null` — media `alt_text` when present
- `averageRating: number | null` — one decimal, only when `reviewCount > 0`
- `reviewCount: number` — `0` when none

Rating aggregate uses only `reviews.status = 'published'`. Never fabricate scores.

## Frontend

`ExperienceTile` accepts optional rating props. When `reviewCount > 0` and `averageRating` is present, render star + average + localized review count beside the title. Otherwise omit the rating UI.

Curated category tiles remain an empty-state path only when the catalog returns no published experiences.

## Out of scope

- Uploading missing BBQ / Kayak / Paddlesurf hero assets
- Video on cards
- Fabricated ratings
- Changing curated empty-state Unsplash paths

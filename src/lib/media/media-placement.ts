import { getPublicStorageUrl } from "@/lib/media/experience-media";

export type PublishedMediaPlacementRow = {
  placement_id: string;
  placement_key: string;
  scope_type: string;
  scope_key: string;
  locale: string | null;
  breakpoint: string;
  role: string;
  variant: string | null;
  alt_text: string | null;
  caption: string | null;
  display_order: number;
  is_primary: boolean;
  media_asset_id: string;
  asset_key: string;
  bucket_id: string;
  storage_path: string;
  media_type: string;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  focal_x: number;
  focal_y: number;
};

export type ResolvedMediaPlacement = {
  id: string;
  assetKey: string;
  placementKey: string;
  role: string;
  breakpoint: string;
  variant: string | null;
  bucketId: string;
  storagePath: string;
  url: string | null;
  mediaType: string;
  mimeType: string | null;
  altText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  focalX: number;
  focalY: number;
  displayOrder: number;
  isPrimary: boolean;
};

export function mapPublishedMediaPlacement(
  row: PublishedMediaPlacementRow
): ResolvedMediaPlacement {
  return {
    id: row.placement_id,
    assetKey: row.asset_key,
    placementKey: row.placement_key,
    role: row.role,
    breakpoint: row.breakpoint,
    variant: row.variant,
    bucketId: row.bucket_id,
    storagePath: row.storage_path,
    url: getPublicStorageUrl(row.bucket_id, row.storage_path),
    mediaType: row.media_type,
    mimeType: row.mime_type,
    altText: row.alt_text,
    caption: row.caption,
    width: row.width,
    height: row.height,
    durationSeconds: row.duration_seconds,
    focalX: row.focal_x,
    focalY: row.focal_y,
    displayOrder: row.display_order,
    isPrimary: row.is_primary
  };
}

export function selectPreferredPlacement(
  placements: ResolvedMediaPlacement[],
  placementKeys: string[],
  breakpoint = "default"
): ResolvedMediaPlacement | null {
  for (const placementKey of placementKeys) {
    const exact = placements.find(
      (item) =>
        item.placementKey === placementKey && item.breakpoint === breakpoint
    );
    if (exact) return exact;

    const fallback = placements.find(
      (item) =>
        item.placementKey === placementKey && item.breakpoint === "default"
    );
    if (fallback) return fallback;
  }

  return placements[0] ?? null;
}

export function mediaObjectPosition(media: {
  focalX: number;
  focalY: number;
}): string {
  return `${media.focalX}% ${media.focalY}%`;
}

/**
 * MapLibre style and fallback viewport for CostaPulse Map View.
 * Prefer MapLibre over Mapbox to avoid token coupling (see ARCHITECTURE.md).
 */
export const MAP_STYLE_URL_ENV = "NEXT_PUBLIC_MAP_STYLE_URL";

/** OpenFreeMap liberty — no API token required. */
export const DEFAULT_MAP_STYLE_URL =
  "https://tiles.openfreemap.org/styles/liberty";

/** Costa Blanca fallback when there are no plottable markers. */
export const MAP_FALLBACK_CENTER = {
  latitude: 38.55,
  longitude: -0.05,
  zoom: 9
} as const;

export const MAP_SINGLE_MARKER_MIN_ZOOM = 11;
export const MAP_CLUSTER_MAX_ZOOM = 14;
export const MAP_FIT_PADDING_PX = 56;

export function resolveMapStyleUrl(
  envValue = process.env.NEXT_PUBLIC_MAP_STYLE_URL
): string {
  const trimmed = envValue?.trim();
  if (trimmed && /^https:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return DEFAULT_MAP_STYLE_URL;
}

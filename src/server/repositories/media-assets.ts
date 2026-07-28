import "server-only";
import {
  BRAND_ASSETS_BUCKET,
  getPublicStorageUrl,
  SITE_LOGO_FALLBACK_SRC
} from "@/lib/media/experience-media";

const SITE_LOGO_STORAGE_PATH = "logos/CostaPulse Logo.png";

export type SiteLogoAsset = {
  url: string;
  alt: string;
  storagePath: string;
  bucketId: string;
  isFallback: boolean;
};

/**
 * Resolves the canonical CostaPulse logo directly from the public
 * Supabase brand-assets bucket. The website and favicon must use the
 * same source asset to keep branding consistent.
 */
export async function getSiteLogoAsset(): Promise<SiteLogoAsset> {
  const url = getPublicStorageUrl(BRAND_ASSETS_BUCKET, SITE_LOGO_STORAGE_PATH);

  if (!url) {
    return {
      url: SITE_LOGO_FALLBACK_SRC,
      alt: "CostaPulse",
      storagePath: SITE_LOGO_FALLBACK_SRC,
      bucketId: "public",
      isFallback: true
    };
  }

  return {
    url,
    alt: "CostaPulse",
    storagePath: SITE_LOGO_STORAGE_PATH,
    bucketId: BRAND_ASSETS_BUCKET,
    isFallback: false
  };
}

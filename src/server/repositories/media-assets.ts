import "server-only";
import {
  BRAND_ASSETS_BUCKET,
  getPublicStorageUrl
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
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing; the CostaPulse brand logo cannot be resolved."
    );
  }

  return {
    url,
    alt: "CostaPulse",
    storagePath: SITE_LOGO_STORAGE_PATH,
    bucketId: BRAND_ASSETS_BUCKET,
    isFallback: false
  };
}

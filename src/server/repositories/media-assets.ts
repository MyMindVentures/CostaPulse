import "server-only";
import {
  BRAND_ASSETS_BUCKET,
  SITE_LOGO_FALLBACK_SRC,
  getPublicStorageUrl,
  selectSiteLogoAsset
} from "@/lib/media/experience-media";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SiteLogoAsset = {
  url: string;
  alt: string;
  storagePath: string;
  bucketId: string;
  isFallback: boolean;
};

/**
 * Resolves the CostaPulse site logo from media_assets (brand-assets/logos/*).
 * Falls back to the local SVG mark when the catalog has no logo.
 */
export async function getSiteLogoAsset(): Promise<SiteLogoAsset> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      url: SITE_LOGO_FALLBACK_SRC,
      alt: "CostaPulse",
      storagePath: SITE_LOGO_FALLBACK_SRC,
      bucketId: "local",
      isFallback: true
    };
  }

  const { data, error } = await supabase
    .from("media_assets")
    .select("bucket_id, storage_path")
    .eq("bucket_id", BRAND_ASSETS_BUCKET)
    .like("storage_path", "logos/%");

  if (error || !data) {
    return {
      url: SITE_LOGO_FALLBACK_SRC,
      alt: "CostaPulse",
      storagePath: SITE_LOGO_FALLBACK_SRC,
      bucketId: "local",
      isFallback: true
    };
  }

  const selected = selectSiteLogoAsset(
    data.map((row) => ({
      bucketId: row.bucket_id,
      storagePath: row.storage_path
    }))
  );

  if (!selected) {
    return {
      url: SITE_LOGO_FALLBACK_SRC,
      alt: "CostaPulse",
      storagePath: SITE_LOGO_FALLBACK_SRC,
      bucketId: "local",
      isFallback: true
    };
  }

  const url = getPublicStorageUrl(selected.bucketId, selected.storagePath);
  if (!url) {
    return {
      url: SITE_LOGO_FALLBACK_SRC,
      alt: "CostaPulse",
      storagePath: SITE_LOGO_FALLBACK_SRC,
      bucketId: "local",
      isFallback: true
    };
  }

  return {
    url,
    alt: "CostaPulse",
    storagePath: selected.storagePath,
    bucketId: selected.bucketId,
    isFallback: false
  };
}

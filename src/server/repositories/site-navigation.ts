import "server-only";
import { DEFAULT_LOCALE, isAppLocale } from "@/i18n/locales";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildSiteNavigationViewModel,
  EMPTY_SITE_NAVIGATION,
  type SiteNavigationRow,
  type SiteNavigationViewModel
} from "@/lib/view-models/site-navigation";

type NavigationQueryRow = {
  id: string;
  item_key: string;
  href: string;
  parent_id: string | null;
  placement: string;
  sort_order: number;
  is_external: boolean;
  site_navigation_item_translations:
    | { label: string; locale: string }
    | { label: string; locale: string }[]
    | null;
};

function normalizeTranslations(
  value: NavigationQueryRow["site_navigation_item_translations"]
): { label: string; locale: string }[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function pickLabel(
  translations: { label: string; locale: string }[],
  locale: string
): string | null {
  const exact = translations.find((entry) => entry.locale === locale);
  if (exact?.label.trim()) return exact.label.trim();

  const fallback = translations.find(
    (entry) => entry.locale === DEFAULT_LOCALE
  );
  if (fallback?.label.trim()) return fallback.label.trim();

  const first = translations.find((entry) => entry.label.trim().length > 0);
  return first?.label.trim() ?? null;
}

/**
 * Loads published site navigation for the requested locale.
 * Labels come from site_navigation_item_translations (DB source of truth).
 */
export async function getPublishedSiteNavigation(
  locale: string = DEFAULT_LOCALE
): Promise<SiteNavigationViewModel> {
  const resolvedLocale = isAppLocale(locale) ? locale : DEFAULT_LOCALE;
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return EMPTY_SITE_NAVIGATION;
  }

  const { data, error } = await supabase
    .from("site_navigation_items")
    .select(
      `
      id,
      item_key,
      href,
      parent_id,
      placement,
      sort_order,
      is_external,
      site_navigation_item_translations ( label, locale )
    `
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return EMPTY_SITE_NAVIGATION;
  }

  const rows: SiteNavigationRow[] = (data as NavigationQueryRow[])
    .filter((row) => row.placement === "primary" || row.placement === "cta")
    .map((row) => ({
      id: row.id,
      item_key: row.item_key,
      href: row.href,
      parent_id: row.parent_id,
      placement: row.placement as "primary" | "cta",
      sort_order: row.sort_order,
      is_external: row.is_external,
      label: pickLabel(
        normalizeTranslations(row.site_navigation_item_translations),
        resolvedLocale
      )
    }));

  return buildSiteNavigationViewModel(rows);
}

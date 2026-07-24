import { z } from "zod";

const navChildSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1),
  href: z.string().min(1),
  label: z.string().min(1),
  isExternal: z.boolean()
});

const navItemSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1),
  href: z.string().min(1),
  label: z.string().min(1),
  isExternal: z.boolean(),
  children: z.array(navChildSchema).default([])
});

const navCtaSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1),
  href: z.string().min(1),
  label: z.string().min(1),
  isExternal: z.boolean()
});

export const siteNavigationViewModelSchema = z.object({
  primary: z.array(navItemSchema),
  cta: navCtaSchema.nullable()
});

export type SiteNavChild = z.infer<typeof navChildSchema>;
export type SiteNavItem = z.infer<typeof navItemSchema>;
export type SiteNavCta = z.infer<typeof navCtaSchema>;
export type SiteNavigationViewModel = z.infer<
  typeof siteNavigationViewModelSchema
>;

export type SiteNavigationRow = {
  id: string;
  item_key: string;
  href: string;
  parent_id: string | null;
  placement: "primary" | "cta";
  sort_order: number;
  is_external: boolean;
  label: string | null;
};

/**
 * Builds a sorted primary tree + single CTA from flat published navigation rows.
 * Rows without a usable label are skipped.
 */
export function buildSiteNavigationViewModel(
  rows: readonly SiteNavigationRow[]
): SiteNavigationViewModel {
  const labeled = rows.filter(
    (row) => typeof row.label === "string" && row.label.trim().length > 0
  );

  const byId = new Map(labeled.map((row) => [row.id, row]));

  const childrenByParent = new Map<string, SiteNavigationRow[]>();
  for (const row of labeled) {
    if (!row.parent_id) continue;
    if (!byId.has(row.parent_id)) continue;
    const list = childrenByParent.get(row.parent_id) ?? [];
    list.push(row);
    childrenByParent.set(row.parent_id, list);
  }

  for (const list of childrenByParent.values()) {
    list.sort((a, b) => a.sort_order - b.sort_order);
  }

  const primaryRoots = labeled
    .filter((row) => row.placement === "primary" && row.parent_id == null)
    .sort((a, b) => a.sort_order - b.sort_order);

  const primary: SiteNavItem[] = primaryRoots.map((row) => {
    const children = (childrenByParent.get(row.id) ?? []).map((child) => ({
      id: child.id,
      key: child.item_key,
      href: child.href,
      label: child.label!.trim(),
      isExternal: child.is_external
    }));

    return {
      id: row.id,
      key: row.item_key,
      href: row.href,
      label: row.label!.trim(),
      isExternal: row.is_external,
      children
    };
  });

  const ctaRow = labeled
    .filter((row) => row.placement === "cta" && row.parent_id == null)
    .sort((a, b) => a.sort_order - b.sort_order)[0];

  const cta: SiteNavCta | null = ctaRow
    ? {
        id: ctaRow.id,
        key: ctaRow.item_key,
        href: ctaRow.href,
        label: ctaRow.label!.trim(),
        isExternal: ctaRow.is_external
      }
    : null;

  return siteNavigationViewModelSchema.parse({ primary, cta });
}

export const EMPTY_SITE_NAVIGATION: SiteNavigationViewModel = {
  primary: [],
  cta: null
};

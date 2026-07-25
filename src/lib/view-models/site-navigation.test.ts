import { describe, expect, it } from "vitest";
import {
  buildSiteNavigationViewModel,
  type SiteNavigationRow
} from "./site-navigation";

const rows: SiteNavigationRow[] = [
  {
    id: "a1000000-0000-4000-8000-000000000001",
    item_key: "experiences",
    href: "/experiences",
    parent_id: null,
    placement: "primary",
    sort_order: 10,
    is_external: false,
    label: "Experiences"
  },
  {
    id: "a1000000-0000-4000-8000-000000000002",
    item_key: "experiences_all",
    href: "/experiences",
    parent_id: "a1000000-0000-4000-8000-000000000001",
    placement: "primary",
    sort_order: 11,
    is_external: false,
    label: "All experiences"
  },
  {
    id: "a1000000-0000-4000-8000-000000000003",
    item_key: "experiences_map",
    href: "/experiences/map",
    parent_id: "a1000000-0000-4000-8000-000000000001",
    placement: "primary",
    sort_order: 12,
    is_external: false,
    label: "Explore map"
  },
  {
    id: "a1000000-0000-4000-8000-000000000004",
    item_key: "services",
    href: "/services",
    parent_id: null,
    placement: "primary",
    sort_order: 20,
    is_external: false,
    label: "Services"
  },
  {
    id: "a1000000-0000-4000-8000-000000000009",
    item_key: "team",
    href: "/team",
    parent_id: null,
    placement: "primary",
    sort_order: 45,
    is_external: false,
    label: "Team"
  },
  {
    id: "a1000000-0000-4000-8000-000000000008",
    item_key: "book_experience",
    href: "/experiences",
    parent_id: null,
    placement: "cta",
    sort_order: 10,
    is_external: false,
    label: "Book Experience"
  }
];

describe("buildSiteNavigationViewModel", () => {
  it("nests children under primary roots and exposes CTA", () => {
    const model = buildSiteNavigationViewModel(rows);

    expect(model.primary).toHaveLength(3);
    expect(model.primary[0]?.key).toBe("experiences");
    expect(model.primary[0]?.children.map((child) => child.key)).toEqual([
      "experiences_all",
      "experiences_map"
    ]);
    expect(model.primary[1]?.key).toBe("services");
    expect(model.primary[2]).toMatchObject({
      key: "team",
      href: "/team",
      label: "Team"
    });
    expect(model.cta?.label).toBe("Book Experience");
    expect(model.cta?.href).toBe("/experiences");
  });

  it("skips rows without labels", () => {
    const model = buildSiteNavigationViewModel([
      ...rows,
      {
        id: "a1000000-0000-4000-8000-000000000099",
        item_key: "orphan",
        href: "/orphan",
        parent_id: null,
        placement: "primary",
        sort_order: 99,
        is_external: false,
        label: null
      }
    ]);

    expect(model.primary.some((item) => item.key === "orphan")).toBe(false);
  });
});

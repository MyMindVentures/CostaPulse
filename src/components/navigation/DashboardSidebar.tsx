"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavigationItem } from "@/config/navigation";
import { isNavHrefActive } from "@/config/navigation";

type DashboardSidebarProps = {
  ariaLabel: string;
  items: readonly NavigationItem[];
  labels: Record<string, string>;
};

export function DashboardSidebar({
  ariaLabel,
  items,
  labels
}: DashboardSidebarProps) {
  const pathname = usePathname();
  return (
    <nav className="dashboard-navigation" aria-label={ariaLabel}>
      {items.map((item) => {
        const active = isNavHrefActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={active ? "is-active" : undefined}
          >
            {labels[item.labelKey]}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavigationItem } from "@/config/navigation";

export function Breadcrumbs({
  items,
  labels,
  homeLabel
}: {
  items: readonly NavigationItem[];
  labels: Record<string, string>;
  homeLabel: string;
}) {
  const pathname = usePathname();
  const current = items.find((item) => item.href === pathname);
  if (!current || current.href === items[0]?.href) return null;
  return (
    <nav className="dashboard-breadcrumbs" aria-label="Breadcrumb">
      <Link href={items[0].href}>{homeLabel}</Link>
      <span aria-hidden>/</span>
      <span aria-current="page">{labels[current.labelKey]}</span>
    </nav>
  );
}

import type { ReactNode } from "react";
import { BrandLink } from "@/components/shared/brand-link";
import { DashboardSidebar } from "@/components/navigation/DashboardSidebar";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import type { NavigationItem } from "@/config/navigation";

type Props = {
  children: ReactNode;
  title: string;
  navigationLabel: string;
  items: readonly NavigationItem[];
  labels: Record<string, string>;
};

export function DashboardShell({
  children,
  title,
  navigationLabel,
  items,
  labels
}: Props) {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <BrandLink href="/" />
        <p className="dashboard-title">{title}</p>
        <DashboardSidebar
          ariaLabel={navigationLabel}
          items={items}
          labels={labels}
        />
      </aside>
      <main className="dashboard-main">
        <Breadcrumbs
          items={items}
          labels={labels}
          homeLabel={labels.overview}
        />
        {children}
      </main>
    </div>
  );
}

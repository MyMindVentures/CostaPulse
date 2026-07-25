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
    <div className="dashboard-shell bg-panel grid min-h-dvh grid-cols-1 md:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)]">
      <aside className="dashboard-sidebar bg-navy flex flex-col gap-6 p-5 text-white md:p-8">
        <BrandLink href="/" />
        <p className="dashboard-title">{title}</p>
        <DashboardSidebar
          ariaLabel={navigationLabel}
          items={items}
          labels={labels}
        />
      </aside>
      <main className="dashboard-main min-w-0 p-[clamp(1.25rem,4vw,3rem)]">
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

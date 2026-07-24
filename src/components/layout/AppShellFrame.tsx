"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import {
  PageBackground,
  type PageBackgroundVariant
} from "@/components/layout/PageBackground";
import type { NavAudience } from "@/config/navigation";
import { cn } from "@/lib/utils";

type AppShellFrameProps = {
  children: ReactNode;
  audience: NavAudience;
  logoSrc?: string | null;
  logoAlt?: string;
  backgroundVariant?: PageBackgroundVariant;
  footer?: ReactNode;
};

/**
 * Client frame: toggles overlay/padding from pathname so home can sit
 * under a transparent navbar without nested route-group shells.
 */
export function AppShellFrame({
  children,
  audience,
  logoSrc,
  logoAlt,
  backgroundVariant = "default",
  footer
}: AppShellFrameProps) {
  const pathname = usePathname();
  const overlayNav = pathname === "/";

  return (
    <div
      className={cn(
        "app-shell",
        overlayNav ? "app-shell--overlay-nav" : "app-shell--padded-nav"
      )}
    >
      <PageBackground variant={backgroundVariant} />
      <Navbar audience={audience} logoSrc={logoSrc} logoAlt={logoAlt} />
      <div className="app-shell__content">{children}</div>
      <footer className="app-shell__footer">{footer}</footer>
    </div>
  );
}

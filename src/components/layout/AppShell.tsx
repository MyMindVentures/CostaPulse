import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppShellFrame } from "@/components/layout/AppShellFrame";
import type { PageBackgroundVariant } from "@/components/layout/PageBackground";
import type { NavAudience } from "@/config/navigation";

type AppShellProps = {
  children: ReactNode;
  audience?: NavAudience;
  logoSrc?: string | null;
  logoAlt?: string;
  backgroundVariant?: PageBackgroundVariant;
  footer?: ReactNode;
};

/**
 * Global marketing shell: background, navbar, content, future footer slot.
 * LanguageSwitcher needs Suspense for useSearchParams.
 */
export function AppShell({
  children,
  audience = "guest",
  logoSrc,
  logoAlt,
  backgroundVariant = "default",
  footer
}: AppShellProps) {
  return (
    <Suspense
      fallback={
        <div className="app-shell app-shell--padded-nav">
          <div className="app-shell__content">{children}</div>
        </div>
      }
    >
      <AppShellFrame
        audience={audience}
        logoSrc={logoSrc}
        logoAlt={logoAlt}
        backgroundVariant={backgroundVariant}
        footer={footer}
      >
        {children}
      </AppShellFrame>
    </Suspense>
  );
}

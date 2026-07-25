"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Menu } from "lucide-react";
import { BrandLink } from "@/components/shared/brand-link";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { NavDropdown } from "@/components/layout/NavDropdown";
import {
  getAccountNav,
  isNavHrefActive,
  isNavItemTreeActive,
  type NavAudience
} from "@/config/navigation";
import type { SiteNavigationViewModel } from "@/lib/view-models/site-navigation";
import { resolveAppLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

type NavbarProps = {
  audience?: NavAudience;
  navigation: SiteNavigationViewModel;
  logoSrc?: string | null;
  logoAlt?: string;
};

const SCROLL_THRESHOLD_PX = 12;

export function Navbar({
  audience = "guest",
  navigation,
  logoSrc,
  logoAlt
}: NavbarProps) {
  const t = useTranslations("Navigation");
  const locale = resolveAppLocale(useLocale());
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuPhase, setMenuPhase] = useState<"closed" | "open" | "closing">(
    "closed"
  );
  const overlayHome = pathname === "/";
  const account = getAccountNav(audience);
  const { primary: items, cta } = navigation;
  const menuMounted = menuPhase !== "closed";
  const menuOpen = menuPhase === "open";

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuPhase !== "closing") return;
    const timeout = window.setTimeout(() => setMenuPhase("closed"), 220);
    return () => window.clearTimeout(timeout);
  }, [menuPhase]);

  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuPhase("closed");
  }

  const closeMenu = useCallback(() => {
    setMenuPhase((phase) => (phase === "open" ? "closing" : phase));
  }, []);
  const overlayTone = overlayHome && !scrolled;

  return (
    <>
      <header
        className={cn(
          "shell-navbar",
          scrolled && "is-scrolled",
          overlayHome && "is-overlay",
          overlayTone && "is-overlay-tone"
        )}
      >
        <div className="shell-navbar__inner mx-auto flex min-h-[var(--shell-nav-height)] w-[min(100%-2rem,76rem)] min-w-0 items-center justify-between gap-4">
          <BrandLink
            href="/"
            className="shell-brand min-w-0 shrink"
            logoSrc={logoSrc}
            logoAlt={logoAlt}
          />

          <nav
            className="shell-navbar__links nav:inline-flex hidden min-w-0 flex-1 items-center justify-center gap-[clamp(1rem,2vw,1.75rem)]"
            aria-label={t("primaryLabel")}
          >
            {items.map((item) => {
              if (item.children.length > 0) {
                return (
                  <NavDropdown
                    key={item.id}
                    item={item}
                    pathname={pathname}
                    overlayTone={overlayTone}
                  />
                );
              }

              const active = isNavItemTreeActive(item, pathname);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={active ? "is-active" : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="shell-navbar__actions inline-flex min-w-11 shrink-0 items-center gap-3 whitespace-nowrap">
            <LanguageSwitcher
              currentLocale={locale}
              className="shell-lang-switch nav:inline-flex hidden items-center gap-1.5 text-[0.72rem] font-extrabold tracking-wider"
            />
            <Link
              href={account.href}
              className="shell-account nav:inline-flex hidden text-[0.82rem] font-bold opacity-[0.85] hover:opacity-100"
            >
              {t(`account.${account.labelKey}`)}
            </Link>
            {cta ? (
              <Link
                href={cta.href}
                className={cn(
                  "button button-coral shell-cta nav:inline-flex hidden",
                  isNavHrefActive(cta.href, pathname) && "is-active"
                )}
              >
                {cta.label}
              </Link>
            ) : null}
            <button
              type="button"
              className="shell-menu-button nav:hidden inline-grid aspect-square min-h-11 w-11 shrink-0 place-items-center"
              aria-label={t("openMenu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuPhase("open")}
            >
              <Menu size={22} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-navigation">
        <MobileNavigation
          mounted={menuMounted}
          open={menuOpen}
          onClose={closeMenu}
          pathname={pathname}
          audience={audience}
          navigation={navigation}
          logoSrc={logoSrc}
          logoAlt={logoAlt}
          overlayTone={overlayTone}
        />
      </div>
    </>
  );
}

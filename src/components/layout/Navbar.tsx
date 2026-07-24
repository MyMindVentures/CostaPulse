"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
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
        <div className="shell-navbar__inner">
          <BrandLink
            href="/"
            className="shell-brand"
            logoSrc={logoSrc}
            logoAlt={logoAlt}
          />

          <nav className="shell-navbar__links" aria-label={t("primaryLabel")}>
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

          <div className="shell-navbar__actions">
            <LanguageSwitcher className="shell-lang-switch" />
            <Link href={account.href} className="shell-account">
              {t(`account.${account.labelKey}`)}
            </Link>
            {cta ? (
              <Link
                href={cta.href}
                className={cn(
                  "button button-coral shell-cta",
                  isNavHrefActive(cta.href, pathname) && "is-active"
                )}
              >
                {cta.label}
              </Link>
            ) : null}
            <button
              type="button"
              className="shell-menu-button"
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

"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { BrandLink } from "@/components/shared/brand-link";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import {
  getAccountNav,
  getPrimaryCta,
  getPrimaryNavItems,
  isNavItemActive,
  type NavAudience
} from "@/config/navigation";
import { cn } from "@/lib/utils";

type NavbarProps = {
  audience?: NavAudience;
  logoSrc?: string | null;
  logoAlt?: string;
};

const SCROLL_THRESHOLD_PX = 12;

export function Navbar({ audience = "guest", logoSrc, logoAlt }: NavbarProps) {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const overlayHome = pathname === "/";
  const items = getPrimaryNavItems(audience);
  const account = getAccountNav(audience);
  const cta = getPrimaryCta(audience);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  const closeMenu = useCallback(() => setMenuOpen(false), []);

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
              const active = isNavItemActive(item.href, pathname);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={active ? "is-active" : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  {t(`items.${item.labelKey}`)}
                </Link>
              );
            })}
          </nav>

          <div className="shell-navbar__actions">
            <LanguageSwitcher className="shell-lang-switch" />
            <Link href={account.href} className="shell-account">
              {t(`account.${account.labelKey}`)}
            </Link>
            <Link href={cta.href} className="button button-coral shell-cta">
              {t(`cta.${cta.labelKey}`)}
            </Link>
            <button
              type="button"
              className="shell-menu-button"
              aria-label={t("openMenu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={22} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-navigation">
        <MobileNavigation
          open={menuOpen}
          onClose={closeMenu}
          pathname={pathname}
          audience={audience}
          logoSrc={logoSrc}
          logoAlt={logoAlt}
          overlayTone={overlayTone}
        />
      </div>
    </>
  );
}

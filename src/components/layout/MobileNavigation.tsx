"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { BrandLink } from "@/components/shared/brand-link";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import {
  getAccountNav,
  getPrimaryCta,
  getPrimaryNavItems,
  isNavItemActive,
  type NavAudience
} from "@/config/navigation";
import { cn } from "@/lib/utils";

type MobileNavigationProps = {
  open: boolean;
  onClose: () => void;
  pathname: string;
  audience: NavAudience;
  logoSrc?: string | null;
  logoAlt?: string;
  overlayTone: boolean;
};

export function MobileNavigation({
  open,
  onClose,
  pathname,
  audience,
  logoSrc,
  logoAlt,
  overlayTone
}: MobileNavigationProps) {
  const t = useTranslations("Navigation");
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const items = getPrimaryNavItems(audience);
  const account = getAccountNav(audience);
  const cta = getPrimaryCta(audience);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="mobile-nav" role="presentation">
      <button
        type="button"
        className="mobile-nav__overlay"
        aria-label={t("dismissMenu")}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={cn("mobile-nav__panel", overlayTone && "is-overlay-tone")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="mobile-nav__header">
          <BrandLink
            href="/"
            className="shell-brand"
            logoSrc={logoSrc}
            logoAlt={logoAlt}
          />
          <button
            ref={closeRef}
            type="button"
            className="mobile-nav__close"
            aria-label={t("closeMenu")}
            onClick={onClose}
          >
            <X size={22} aria-hidden />
          </button>
        </div>

        <p id={titleId} className="sr-only">
          {t("primaryLabel")}
        </p>

        <nav className="mobile-nav__links" aria-label={t("primaryLabel")}>
          {items.map((item) => {
            const active = isNavItemActive(item.href, pathname);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={onClose}
              >
                {t(`items.${item.labelKey}`)}
              </Link>
            );
          })}
        </nav>

        <div className="mobile-nav__actions">
          <LanguageSwitcher className="shell-lang-switch" />
          <Link href={account.href} className="shell-account" onClick={onClose}>
            {t(`account.${account.labelKey}`)}
          </Link>
          <Link
            href={cta.href}
            className="button button-coral"
            onClick={onClose}
          >
            {t(`cta.${cta.labelKey}`)}
          </Link>
        </div>
      </div>
    </div>
  );
}

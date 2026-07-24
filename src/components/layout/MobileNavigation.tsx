"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, X } from "lucide-react";
import { BrandLink } from "@/components/shared/brand-link";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import {
  getAccountNav,
  isNavHrefActive,
  isNavItemTreeActive,
  type NavAudience
} from "@/config/navigation";
import type { SiteNavigationViewModel } from "@/lib/view-models/site-navigation";
import { cn } from "@/lib/utils";

type MobileNavigationProps = {
  mounted: boolean;
  open: boolean;
  onClose: () => void;
  pathname: string;
  audience: NavAudience;
  navigation: SiteNavigationViewModel;
  logoSrc?: string | null;
  logoAlt?: string;
  overlayTone: boolean;
};

export function MobileNavigation({
  mounted,
  open,
  onClose,
  pathname,
  audience,
  navigation,
  logoSrc,
  logoAlt,
  overlayTone
}: MobileNavigationProps) {
  const t = useTranslations("Navigation");
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const account = getAccountNav(audience);
  const { primary: items, cta } = navigation;
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!mounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (open) {
      closeRef.current?.focus();
    }

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
  }, [mounted, open, onClose]);

  if (!mounted) return null;

  return (
    <div className={cn("mobile-nav", open && "is-open")} role="presentation">
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
            if (item.children.length > 0) {
              const expanded =
                expandedKeys[item.id] ?? isNavItemTreeActive(item, pathname);
              return (
                <div key={item.id} className="mobile-nav__group">
                  <button
                    type="button"
                    className={cn(
                      "mobile-nav__group-trigger",
                      isNavItemTreeActive(item, pathname) && "is-active"
                    )}
                    aria-expanded={expanded}
                    onClick={() =>
                      setExpandedKeys((current) => ({
                        ...current,
                        [item.id]: !expanded
                      }))
                    }
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      size={18}
                      aria-hidden
                      className={cn(
                        "mobile-nav__group-chevron",
                        expanded && "is-open"
                      )}
                    />
                  </button>
                  {expanded ? (
                    <div className="mobile-nav__sublinks">
                      {item.children.map((child) => {
                        const active = isNavHrefActive(child.href, pathname);
                        return (
                          <Link
                            key={child.id}
                            href={child.href}
                            className={active ? "is-active" : undefined}
                            aria-current={active ? "page" : undefined}
                            onClick={onClose}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            }

            const active = isNavItemTreeActive(item, pathname);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={onClose}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mobile-nav__actions">
          <LanguageSwitcher className="shell-lang-switch" />
          <Link href={account.href} className="shell-account" onClick={onClose}>
            {t(`account.${account.labelKey}`)}
          </Link>
          {cta ? (
            <Link
              href={cta.href}
              className="button button-coral"
              onClick={onClose}
            >
              {cta.label}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

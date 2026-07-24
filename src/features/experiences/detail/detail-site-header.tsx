import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { BrandLink } from "@/components/shared/brand-link";
import { getSiteLogoAsset } from "@/server/repositories/media-assets";

type NavItem = {
  label: string;
  href: string;
};

function resolveNavHref(href: string): string {
  if (href.startsWith("#")) {
    if (href === "#experiences") return "/experiences";
    return `/${href}`;
  }
  return href;
}

export async function DetailSiteHeader() {
  const t = await getTranslations("HomePage");
  const locale = await getLocale();
  const siteLogo = await getSiteLogoAsset();
  const navItems = (t.raw("nav") as NavItem[]).map((item) => ({
    ...item,
    href: resolveNavHref(item.href),
    active: item.href === "#experiences" || item.href === "/experiences"
  }));

  return (
    <header className="xp-detail-header">
      <div className="xp-detail-header-inner">
        <BrandLink
          href="/"
          className="xp-detail-brand"
          logoSrc={siteLogo.url}
          logoAlt={siteLogo.alt}
        />

        <nav className="xp-detail-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={item.active ? "is-active" : undefined}
              aria-current={item.active ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="xp-detail-header-actions">
          <button type="button" className="xp-icon-button" aria-label="Wishlist" disabled>
            <Heart size={18} aria-hidden />
          </button>
          <button type="button" className="xp-icon-button" aria-label="Cart" disabled>
            <ShoppingCart size={18} aria-hidden />
          </button>
          <span className="xp-lang-pill" aria-hidden>
            {locale.split("-")[0]?.toUpperCase() ?? locale.toUpperCase()}
          </span>
          <a href="#booking" className="button button-navy">
            {t("bookCta")}
          </a>
        </div>
      </div>
    </header>
  );
}

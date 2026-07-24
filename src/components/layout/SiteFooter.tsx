import Link from "next/link";
import type { SiteNavigationViewModel } from "@/lib/view-models/site-navigation";

type SiteFooterProps = {
  navigation: SiteNavigationViewModel;
  logoSrc?: string | null;
  logoAlt?: string;
};

const footerLinks = {
  discover: [
    { label: "All experiences", href: "/experiences" },
    { label: "Explore the map", href: "/experiences/map" },
    { label: "Destinations", href: "/destinations" },
    { label: "Services", href: "/services" }
  ],
  company: [
    { label: "About CostaPulse", href: "/about" },
    { label: "Partners", href: "/partners" },
    { label: "Contact", href: "/contact" },
    { label: "Frequently asked questions", href: "/faq" }
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" }
  ]
};

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link className="site-footer__link" href={href}>
        {label}
      </Link>
    </li>
  );
}

export function SiteFooter({
  navigation,
  logoSrc,
  logoAlt = "CostaPulse"
}: SiteFooterProps) {
  const year = new Date().getFullYear();
  const sitemapLinks = navigation.primary.flatMap((item) => [
    { label: item.label, href: item.href },
    ...item.children.map((child) => ({
      label: child.label,
      href: child.href
    }))
  ]);

  return (
    <div className="site-footer">
      <div className="site-footer__glow" aria-hidden="true" />
      <div className="container site-footer__inner">
        <section className="site-footer__lead" aria-labelledby="footer-heading">
          <div className="site-footer__brand-block">
            <Link className="site-footer__brand" href="/" aria-label="CostaPulse home">
              {logoSrc ? (
                <img src={logoSrc} alt={logoAlt} className="site-footer__logo" />
              ) : (
                <span>CostaPulse</span>
              )}
            </Link>
            <p className="site-footer__eyebrow">Costa Blanca, thoughtfully curated</p>
            <h2 id="footer-heading">Make your next Mediterranean day unforgettable.</h2>
            <p className="site-footer__intro">
              Exceptional yacht, water and local experiences, selected with care and
              delivered by people who know the coast.
            </p>
          </div>

          <div className="site-footer__cta-card">
            <p className="site-footer__cta-kicker">Ready when you are</p>
            <h3>Find your Costa Blanca experience.</h3>
            <p>Browse live experiences, compare options and book with confidence.</p>
            <Link className="button button-coral" href="/experiences">
              Explore experiences
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>

        <div className="site-footer__rule" />

        <nav className="site-footer__sitemap" aria-label="Footer sitemap">
          <div className="site-footer__column site-footer__column--wide">
            <p className="site-footer__column-title">Sitemap</p>
            <ul>
              {sitemapLinks.map((link) => (
                <FooterLink key={`${link.href}-${link.label}`} {...link} />
              ))}
            </ul>
          </div>

          <div className="site-footer__column">
            <p className="site-footer__column-title">Discover</p>
            <ul>
              {footerLinks.discover.map((link) => (
                <FooterLink key={link.href} {...link} />
              ))}
            </ul>
          </div>

          <div className="site-footer__column">
            <p className="site-footer__column-title">CostaPulse</p>
            <ul>
              {footerLinks.company.map((link) => (
                <FooterLink key={link.href} {...link} />
              ))}
            </ul>
          </div>

          <div className="site-footer__column site-footer__contact">
            <p className="site-footer__column-title">Local support</p>
            <p>Planning something special or travelling with a group?</p>
            <a className="site-footer__contact-link" href="mailto:hello@costapulse.club">
              hello@costapulse.club
            </a>
            <p className="site-footer__microcopy">Based on the Costa Blanca, Spain.</p>
          </div>
        </nav>

        <div className="site-footer__bottom">
          <p>© {year} CostaPulse. The Mediterranean, thoughtfully curated.</p>
          <ul aria-label="Legal links">
            {footerLinks.legal.map((link) => (
              <FooterLink key={link.href} {...link} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

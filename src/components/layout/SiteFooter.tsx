import Link from "next/link";
import Image from "next/image";
import type { SiteNavigationViewModel } from "@/lib/view-models/site-navigation";
import styles from "./SiteFooter.module.css";

type SiteFooterProps = {
  navigation: SiteNavigationViewModel;
  logoSrc?: string | null;
  logoAlt?: string;
};

type FooterLinkItem = {
  label: string;
  href: string;
  isExternal?: boolean;
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
} satisfies Record<string, FooterLinkItem[]>;

function FooterLink({ href, label, isExternal = false }: FooterLinkItem) {
  return (
    <li>
      <Link
        className={styles.link}
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
      >
        {label}
        {isExternal ? (
          <span className="sr-only"> (opens in a new tab)</span>
        ) : null}
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
    {
      label: item.label,
      href: item.href,
      isExternal: item.isExternal
    },
    ...item.children.map((child) => ({
      label: child.label,
      href: child.href,
      isExternal: child.isExternal
    }))
  ]);

  return (
    <div className={styles.footer}>
      <div className={styles.inner}>
        <section className={styles.lead} aria-labelledby="footer-heading">
          <div className={styles.brandBlock}>
            <Link
              className={styles.brand}
              href="/"
              aria-label="CostaPulse home"
            >
              {logoSrc ? (
                <Image
                  src={logoSrc}
                  alt={logoAlt}
                  className={styles.logo}
                  width={180}
                  height={54}
                  unoptimized
                />
              ) : (
                <span className={styles.brandFallback}>CostaPulse</span>
              )}
            </Link>
            <p className={styles.eyebrow}>Costa Blanca, thoughtfully curated</p>
            <h2 className={styles.heading} id="footer-heading">
              Make your next Mediterranean day unforgettable.
            </h2>
            <p className={styles.intro}>
              Exceptional yacht, water and local experiences, selected with care
              and delivered by people who know the coast.
            </p>
          </div>

          <div className={styles.ctaCard}>
            <p className={styles.ctaKicker}>Ready when you are</p>
            <h3>Find your Costa Blanca experience.</h3>
            <p>
              Browse live experiences, compare options and book with confidence.
            </p>
            <Link className={styles.cta} href="/experiences">
              Explore experiences
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>

        <div className={styles.rule} aria-hidden="true" />

        <nav className={styles.sitemap} aria-label="Footer sitemap">
          <div className={styles.column}>
            <p className={styles.columnTitle}>Sitemap</p>
            <ul className={styles.list}>
              {sitemapLinks.map((link) => (
                <FooterLink key={`${link.href}-${link.label}`} {...link} />
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <p className={styles.columnTitle}>Discover</p>
            <ul className={styles.list}>
              {footerLinks.discover.map((link) => (
                <FooterLink key={link.href} {...link} />
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <p className={styles.columnTitle}>CostaPulse</p>
            <ul className={styles.list}>
              {footerLinks.company.map((link) => (
                <FooterLink key={link.href} {...link} />
              ))}
            </ul>
          </div>

          <div className={`${styles.column} ${styles.contact}`}>
            <p className={styles.columnTitle}>Local support</p>
            <p>Planning something special or travelling with a group?</p>
            <a
              className={styles.contactLink}
              href="mailto:hello@costapulse.club"
            >
              hello@costapulse.club
            </a>
            <p className={styles.microcopy}>
              Based on the Costa Blanca, Spain.
            </p>
          </div>
        </nav>

        <div className={styles.bottom}>
          <p>© {year} CostaPulse. The Mediterranean, thoughtfully curated.</p>
          <ul className={styles.legalList} aria-label="Legal links">
            {footerLinks.legal.map((link) => (
              <FooterLink key={link.href} {...link} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

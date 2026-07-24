import { ArrowRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <main>
      <section className="hero-shell">
        <nav className="nav-shell" aria-label="Primary navigation">
          <Link href="/" className="brand-mark">
            Costa<span>Pulse</span>
          </Link>
          <Link href="/experiences" className="nav-cta">
            {t("browse")}
          </Link>
        </nav>

        <div className="hero-content">
          <p className="eyebrow">
            <Sparkles size={16} aria-hidden="true" /> Costa Blanca, curated
          </p>
          <h1>{t("title")}</h1>
          <p className="hero-copy">{t("description")}</p>
          <div className="hero-actions">
            <Link href="/experiences" className="button-primary">
              {t("browse")} <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/about" className="button-secondary">
              {t("discover")}
            </Link>
          </div>
        </div>
      </section>

      <section className="value-grid" aria-label="CostaPulse advantages">
        <article>
          <Compass aria-hidden="true" />
          <h2>{t("localTitle")}</h2>
          <p>{t("localDescription")}</p>
        </article>
        <article>
          <ShieldCheck aria-hidden="true" />
          <h2>{t("trustedTitle")}</h2>
          <p>{t("trustedDescription")}</p>
        </article>
        <article>
          <Sparkles aria-hidden="true" />
          <h2>{t("premiumTitle")}</h2>
          <p>{t("premiumDescription")}</p>
        </article>
      </section>
    </main>
  );
}

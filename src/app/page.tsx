import { ArrowDownRight, ArrowRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

const experiences = [
  { number: "01", title: "Private charters", copy: "Unhurried days at sea, shaped around you and your guests." },
  { number: "02", title: "Coastal adventures", copy: "A different view of hidden coves, clear water and dramatic coastline." },
  { number: "03", title: "Local hospitality", copy: "Memorable tables, trusted hosts and the flavours of the Costa Blanca." }
];

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CostaPulse",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.costapulse.club",
    description: "Curated Costa Blanca experiences"
  };

  return (
    <main>
      <section className="hero" id="top">
        <nav className="nav wrap" aria-label="Primary navigation">
          <a href="#top" className="brand" aria-label="CostaPulse home">Costa<span>Pulse</span></a>
          <a href="#experiences" className="nav-link">Explore <ArrowDownRight size={16} aria-hidden /></a>
        </nav>
        <div className="hero-orb" aria-hidden />
        <div className="hero-content wrap">
          <p className="eyebrow"><span /> Costa Blanca · Spain</p>
          <h1>{t("title")}</h1>
          <div className="hero-bottom">
            <p>{t("description")}</p>
            <a href="#experiences" className="circle-button" aria-label="Explore our experiences"><ArrowDownRight aria-hidden /></a>
          </div>
        </div>
        <p className="vertical-note" aria-hidden>38.3452° N · 0.4810° W</p>
      </section>

      <section className="intro wrap" aria-labelledby="intro-title">
        <p className="section-kicker">The CostaPulse edit</p>
        <div>
          <h2 id="intro-title">Mediterranean days,<br/><em>beautifully considered.</em></h2>
          <p>We bring together remarkable local people and places, so every experience feels effortless, personal and unmistakably Costa Blanca.</p>
        </div>
      </section>

      <section className="experiences" id="experiences" aria-labelledby="experiences-title">
        <div className="wrap">
          <div className="section-heading">
            <p className="section-kicker light">A first glimpse</p>
            <h2 id="experiences-title">Ways to feel<br/>more <em>alive.</em></h2>
          </div>
          <div className="experience-list">
            {experiences.map((experience) => (
              <article key={experience.number}>
                <span>{experience.number}</span>
                <div><h3>{experience.title}</h3><p>{experience.copy}</p></div>
                <Compass aria-hidden />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="trust wrap" aria-label="Why CostaPulse">
        <article><ShieldCheck aria-hidden /><h3>Chosen with care</h3><p>Every host and experience is selected for quality, character and genuine local knowledge.</p></article>
        <article><Sparkles aria-hidden /><h3>Effortlessly personal</h3><p>Clear guidance and thoughtful service, from first inspiration to your day on the coast.</p></article>
      </section>

      <section className="cta">
        <div className="wrap">
          <p className="section-kicker">Your Mediterranean story</p>
          <h2>Good days begin<br/>with a little <em>curiosity.</em></h2>
          <a href="mailto:hello@costapulse.club" className="text-link">Start a conversation <ArrowRight size={18} aria-hidden /></a>
        </div>
      </section>

      <footer className="footer wrap">
        <a href="#top" className="brand">Costa<span>Pulse</span></a>
        <p>Curated on the Costa Blanca.</p>
        <p>© {new Date().getFullYear()} CostaPulse</p>
      </footer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    </main>
  );
}

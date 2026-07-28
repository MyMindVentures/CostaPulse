import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/shared/empty-state";
import type { StrategyPageViewModel } from "./strategy-view-model";

export async function StrategyPageStatic({
  page
}: {
  page: StrategyPageViewModel;
}) {
  const t = await getTranslations("WhyCostaPulse");
  const { strategies, primaryMission: mission } = page;

  if (!strategies.length) {
    return (
      <Container className="py-24">
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      </Container>
    );
  }

  return (
    <main>
      <section
        className="bg-navy relative isolate min-h-[72svh] overflow-hidden text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6, 25, 43, .62), rgba(6, 25, 43, .62)), url('/brand/hero-home.png')",
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      >
        <Container className="relative flex min-h-[72svh] items-end py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="text-gold text-sm font-semibold tracking-widest uppercase">
              {t("eyebrow")}
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl lg:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/85">{t("intro")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="button button-coral" href="#ecosystem">
                {t("explore")}
              </a>
              <Link className="button button-light" href="/partners">
                {t("partnerCta")}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {mission ? (
        <section className="bg-sand py-20 sm:py-28">
          <Container>
            <p className="text-gold text-sm font-semibold tracking-widest uppercase">
              {mission.title || t("mission")}
            </p>
            <blockquote className="text-navy mt-6 max-w-4xl font-serif text-4xl leading-tight sm:text-5xl">
              “{mission.statement}”
            </blockquote>
            {mission.supportingStatement ? (
              <p className="text-muted mt-6 max-w-2xl text-lg">
                {mission.supportingStatement}
              </p>
            ) : null}
          </Container>
        </section>
      ) : null}

      <section id="ecosystem" className="bg-panel py-20 sm:py-28">
        <Container>
          <p className="text-turquoise-deep text-sm font-semibold tracking-widest uppercase">
            {t("overviewEyebrow")}
          </p>
          <h2 className="text-navy mt-4 max-w-3xl font-serif text-4xl sm:text-5xl">
            {t("overviewTitle")}
          </h2>
          <p className="text-muted mt-5 max-w-2xl">{t("overviewIntro")}</p>

          <nav
            aria-label={t("roleNavigation")}
            className="mt-10 flex snap-x gap-3 overflow-x-auto pb-3"
          >
            {strategies.map((strategy) => {
              const role =
                strategy.user_role ||
                strategy.stakeholder_key ||
                strategy.audience_key;
              return (
                <a
                  key={strategy.id}
                  href={`#${strategy.id}`}
                  className={`button min-h-11 shrink-0 snap-start ${
                    strategy.audience_key === "founder"
                      ? "button-coral"
                      : "button-outline"
                  }`}
                >
                  {role}
                </a>
              );
            })}
          </nav>

          <div className="mt-8 space-y-8">
            {strategies.map((strategy) => {
              const founder = strategy.audience_key === "founder";
              const role =
                strategy.user_role ||
                strategy.stakeholder_key ||
                strategy.audience_key;
              const normalizedRole = role.trim().toLowerCase();

              return (
                <article
                  id={strategy.id}
                  key={strategy.id}
                  className={`scroll-mt-28 rounded-3xl border p-6 shadow-sm sm:p-9 lg:p-12 ${
                    founder
                      ? "border-gold bg-navy text-white"
                      : "border-border bg-white"
                  }`}
                >
                  <span className="border-gold/50 text-navy inline-flex rounded-full border bg-white px-3 py-1 text-xs font-semibold tracking-widest uppercase">
                    {role}
                  </span>
                  <h2
                    className={`mt-5 font-serif text-3xl sm:text-4xl ${founder ? "text-white" : "text-navy"}`}
                  >
                    {strategy.title}
                  </h2>
                  <p
                    className={`mt-4 max-w-3xl text-lg ${founder ? "text-white/80" : "text-muted"}`}
                  >
                    {strategy.summary}
                  </p>
                  <div
                    className={`border-gold my-8 border-l-2 pl-5 ${founder ? "text-white" : "text-ink"}`}
                  >
                    <p className="text-gold text-xs font-semibold tracking-widest uppercase">
                      {t("objective")}
                    </p>
                    <p className="mt-2 text-lg">{strategy.objective}</p>
                  </div>
                  {strategy.description ? (
                    <p
                      className={`mb-8 max-w-3xl ${founder ? "text-white/75" : "text-muted"}`}
                    >
                      {strategy.description}
                    </p>
                  ) : null}
                  {strategy.win_win.length ? (
                    <ul className="grid gap-4 md:grid-cols-2">
                      {strategy.win_win.map((item, index) => {
                        const own =
                          item.beneficiary_role.trim().toLowerCase() ===
                          normalizedRole;
                        return (
                          <li
                            key={`${strategy.id}-${item.beneficiary_role}-${index}`}
                            className={`rounded-2xl border p-5 ${own ? "border-turquoise bg-panel" : "border-border bg-white"}`}
                          >
                            <p className="text-navy mb-4 font-semibold">
                              {item.beneficiary_role}
                            </p>
                            <p className="text-turquoise-deep text-xs font-semibold tracking-widest uppercase">
                              {t("gain")}
                            </p>
                            <p className="text-ink mt-1">{item.benefit}</p>
                            <p className="text-muted mt-4 text-xs font-semibold tracking-widest uppercase">
                              {t("matters")}
                            </p>
                            <p className="text-muted mt-1">{item.motivation}</p>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-sand py-20 text-center sm:py-28">
        <Container>
          <h2 className="text-navy font-serif text-4xl sm:text-5xl">
            {t("closingTitle")}
          </h2>
          <p className="text-muted mx-auto mt-5 max-w-2xl">
            {t("closingIntro")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link className="button button-coral" href="/experiences">
              {t("experiencesCta")}
            </Link>
            <Link className="button button-outline" href="/partners">
              {t("partnerCta")}
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}

import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/shared/empty-state";
import type { StrategyPageViewModel } from "./strategy-view-model";
import { RoleAccordionGroup } from "./role-accordion-group";
import {
  resolveStrategyRoleKey,
  STRATEGY_ROLE_DISPLAY_MAP
} from "./role-display-map";

export async function StrategyPageStatic({
  page
}: {
  page: StrategyPageViewModel;
}) {
  const t = await getTranslations("WhyCostaPulse");
  const { strategies, primaryMission: mission } = page;
  const roleItems = strategies.flatMap((strategy) => {
    const role = resolveStrategyRoleKey(
      strategy.audience_key,
      strategy.user_role,
      strategy.stakeholder_key
    );
    if (!role) return [];
    return [
      {
        role,
        label: t(STRATEGY_ROLE_DISPLAY_MAP[role].labelKey),
        strategy
      }
    ];
  });

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
        <Container className="relative flex min-h-[72svh] w-[min(100%-2.5rem,76rem)] items-end py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="text-gold text-sm font-semibold tracking-widest uppercase">
              {t("eyebrow")}
            </p>
            <h1 className="mt-5 max-w-2xl font-serif text-4xl leading-tight sm:text-6xl lg:text-7xl">
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
          <Container className="w-[min(100%-2.5rem,76rem)]">
            <p className="text-gold text-sm font-semibold tracking-widest uppercase">
              {mission.title || t("mission")}
            </p>
            <blockquote className="text-navy mt-6 max-w-4xl font-serif text-3xl leading-tight sm:text-5xl">
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

      <section
        id="ecosystem"
        className="bg-sand scroll-mt-[var(--shell-nav-height)] py-16 sm:py-24"
      >
        <Container className="w-[min(100%-2.5rem,76rem)]">
          <p className="text-turquoise-deep text-sm font-semibold tracking-widest uppercase">
            {t("overviewEyebrow")}
          </p>
          <h2 className="text-navy mt-4 max-w-3xl font-serif text-3xl leading-tight sm:text-5xl">
            {t("overviewTitle")}
          </h2>
          <p className="text-ink mt-5 max-w-2xl text-lg leading-relaxed">
            {t("overviewIntro")}
          </p>

          <RoleAccordionGroup
            items={roleItems}
            labels={{
              gain: t("gain"),
              matters: t("matters"),
              workflow: t("workflow")
            }}
          />
        </Container>
      </section>

      <section className="bg-sand py-20 text-center sm:py-28">
        <Container className="w-[min(100%-2.5rem,76rem)]">
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

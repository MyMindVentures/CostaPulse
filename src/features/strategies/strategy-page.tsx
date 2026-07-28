import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import type { StrategyCardViewModel } from "./strategy-view-model";
import { RoleSelector } from "./role-selector";

function RoleBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-gold/50 text-navy inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-widest uppercase">
      {children}
    </span>
  );
}

function WinWinList({
  items,
  owner,
  gain,
  matters
}: {
  items: StrategyCardViewModel["win_win"];
  owner: string;
  gain: string;
  matters: string;
}) {
  if (!items.length) return null;
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map((item) => {
        const own = item.beneficiary_role.toLowerCase() === owner.toLowerCase();
        return (
          <li
            key={`${item.beneficiary_role}-${item.benefit}`}
            className={`rounded-2xl border p-5 ${own ? "border-turquoise bg-panel" : "border-border bg-white"}`}
          >
            <p className="text-navy mb-4 font-semibold">
              {item.beneficiary_role}
            </p>
            <p className="text-turquoise-deep text-xs font-semibold tracking-widest uppercase">
              {gain}
            </p>
            <p className="text-ink mt-1">{item.benefit}</p>
            <p className="text-muted mt-4 text-xs font-semibold tracking-widest uppercase">
              {matters}
            </p>
            <p className="text-muted mt-1">{item.motivation}</p>
          </li>
        );
      })}
    </ul>
  );
}

function StrategyCard({
  strategy,
  labels
}: {
  strategy: StrategyCardViewModel;
  labels: {
    objective: string;
    gain: string;
    matters: string;
    details: string;
    action: string;
    metrics: string;
    mission: string;
  };
}) {
  const founder = strategy.audience_key === "founder";
  const role =
    strategy.user_role ?? strategy.stakeholder_key ?? strategy.audience_key;
  return (
    <article
      id={strategy.id}
      className={`scroll-mt-28 rounded-3xl border p-6 shadow-sm sm:p-9 lg:p-12 ${founder ? "border-gold bg-navy text-white" : "border-border bg-white"}`}
    >
      <RoleBadge>{role}</RoleBadge>
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
          {labels.objective}
        </p>
        <p className="mt-2 text-lg">{strategy.objective}</p>
      </div>
      {strategy.description && (
        <p
          className={`mb-8 max-w-3xl ${founder ? "text-white/75" : "text-muted"}`}
        >
          {strategy.description}
        </p>
      )}
      <WinWinList
        items={strategy.win_win}
        owner={role}
        gain={labels.gain}
        matters={labels.matters}
      />
      {(strategy.action_plan.length > 0 ||
        strategy.success_metrics.length > 0) && (
        <details
          className={`mt-8 border-t pt-2 ${founder ? "border-white/20" : "border-border"}`}
        >
          <summary className="focus-visible:ring-turquoise min-h-11 cursor-pointer py-4 font-semibold focus-visible:ring-2 focus-visible:outline-none">
            {labels.details}
          </summary>
          <div className="grid gap-8 pb-4 md:grid-cols-2">
            {strategy.action_plan.length > 0 && (
              <div>
                <h3 className="font-serif text-2xl">{labels.action}</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {strategy.action_plan.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {strategy.success_metrics.length > 0 && (
              <div>
                <h3 className="font-serif text-2xl">{labels.metrics}</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {strategy.success_metrics.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>
      )}
      {strategy.mission_statements.map((mission) => (
        <blockquote
          key={mission.statement}
          className={`mt-8 border-t pt-8 font-serif text-xl ${founder ? "border-white/20 text-white/90" : "border-border text-navy"}`}
        >
          <span className="text-gold mb-2 block font-sans text-xs font-semibold tracking-widest uppercase">
            {labels.mission}
          </span>
          {mission.statement}
        </blockquote>
      ))}
    </article>
  );
}

export async function StrategyPage({
  strategies
}: {
  strategies: StrategyCardViewModel[];
}) {
  const t = await getTranslations("WhyCostaPulse");
  if (!strategies.length)
    return (
      <Container className="py-24">
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      </Container>
    );
  const mission = strategies.flatMap((item) => item.mission_statements)[0];
  const loop = strategies
    .flatMap((item) => item.ecosystemLoop)
    .filter((value, index, all) => all.indexOf(value) === index);
  const labels = {
    objective: t("objective"),
    gain: t("gain"),
    matters: t("matters"),
    details: t("details"),
    action: t("action"),
    metrics: t("metrics"),
    mission: t("mission")
  };
  return (
    <main>
      <section className="bg-navy relative isolate min-h-[72svh] overflow-hidden text-white">
        <Image
          src="/brand/hero-home.png"
          alt=""
          fill
          priority
          className="object-cover opacity-45"
        />
        <div className="bg-navy/50 absolute inset-0" />
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
              <Button asChild>
                <a href="#ecosystem">{t("explore")}</a>
              </Button>
              <Button asChild variant="light">
                <Link href="/partners">{t("partnerCta")}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
      {mission && (
        <section className="bg-sand py-20 sm:py-28">
          <Container>
            <p className="text-gold text-sm font-semibold tracking-widest uppercase">
              {mission.title ?? t("mission")}
            </p>
            <blockquote className="text-navy mt-6 max-w-4xl font-serif text-4xl leading-tight sm:text-5xl">
              “{mission.statement}”
            </blockquote>
            {mission.supportingStatement && (
              <p className="text-muted mt-6 max-w-2xl text-lg">
                {mission.supportingStatement}
              </p>
            )}
          </Container>
        </section>
      )}
      <section id="ecosystem" className="bg-panel py-20 sm:py-28">
        <Container>
          <p className="text-turquoise-deep text-sm font-semibold tracking-widest uppercase">
            {t("overviewEyebrow")}
          </p>
          <h2 className="text-navy mt-4 max-w-3xl font-serif text-4xl sm:text-5xl">
            {t("overviewTitle")}
          </h2>
          <p className="text-muted mt-5 max-w-2xl">{t("overviewIntro")}</p>
          <div className="mt-10">
            <RoleSelector
              label={t("roleNavigation")}
              roles={strategies.map((item) => ({
                id: item.id,
                label:
                  item.user_role ?? item.stakeholder_key ?? item.audience_key,
                founder: item.audience_key === "founder"
              }))}
            />
          </div>
          <div className="mt-8 space-y-8">
            {strategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                labels={labels}
              />
            ))}
          </div>
        </Container>
      </section>
      {loop.length > 0 && (
        <section className="bg-white py-20 sm:py-28">
          <Container>
            <h2 className="text-navy font-serif text-4xl">
              {t("exampleTitle")}
            </h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loop.map((step, index) => (
                <li
                  key={step}
                  className="border-border flex gap-4 rounded-2xl border p-5"
                >
                  <span className="text-gold font-serif text-2xl">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}
      <section className="bg-sand py-20 text-center sm:py-28">
        <Container>
          <h2 className="text-navy font-serif text-4xl sm:text-5xl">
            {t("closingTitle")}
          </h2>
          <p className="text-muted mx-auto mt-5 max-w-2xl">
            {t("closingIntro")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/experiences">{t("experiencesCta")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/partners">{t("partnerCta")}</Link>
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}

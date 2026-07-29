import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Badge } from "@/components/ui/badge";

function AboutPanel({
  id,
  eyebrow,
  index,
  title,
  children,
  tone = "white"
}: {
  id?: string;
  eyebrow?: string;
  index?: string;
  title: string;
  children: ReactNode;
  tone?: "white" | "soft" | "navy";
}) {
  const toneClass =
    tone === "navy"
      ? "bg-navy text-white border-white/15"
      : tone === "soft"
        ? "bg-[linear-gradient(145deg,rgba(255,253,248,1),rgba(238,246,246,.95))] border-[color:var(--border)]"
        : "bg-white border-[color:var(--border)]";

  return (
    <section
      id={id}
      className={`overflow-hidden rounded-[1.75rem] border p-6 shadow-[0_1.2rem_2.8rem_rgba(7,31,47,0.08)] sm:p-8 lg:p-10 ${toneClass}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {eyebrow ? (
          <p
            className={
              tone === "navy"
                ? "text-gold text-xs font-semibold tracking-[0.18em] uppercase"
                : "text-turquoise-deep text-xs font-semibold tracking-[0.18em] uppercase"
            }
          >
            {eyebrow}
          </p>
        ) : null}
        {index ? (
          <span
            className={
              tone === "navy"
                ? "rounded-full border border-white/25 px-3 py-1 text-xs font-semibold tracking-[0.16em]"
                : "text-navy rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs font-semibold tracking-[0.16em]"
            }
          >
            {index}
          </span>
        ) : null}
      </div>
      <h2
        className={
          tone === "navy"
            ? "mt-4 font-serif text-3xl leading-tight sm:text-4xl"
            : "text-navy mt-4 font-serif text-3xl leading-tight sm:text-4xl"
        }
      >
        {title}
      </h2>
      <div
        className={
          tone === "navy"
            ? "mt-5 grid gap-4 leading-relaxed text-white/84"
            : "mt-5 grid gap-4 leading-relaxed text-[color:var(--muted)]"
        }
      >
        {children}
      </div>
    </section>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MarketingPages.about.meta");
  return {
    title: t("title"),
    description: t("description")
  };
}

export default async function AboutPage() {
  const t = await getTranslations("MarketingPages.about");
  const promiseItems = [
    t("promiseItem1"),
    t("promiseItem2"),
    t("promiseItem3"),
    t("promiseItem4"),
    t("promiseItem5"),
    t("promiseItem6")
  ];
  const heroAnchors = [
    { href: "#discover", label: t("discoverTitle") },
    { href: "#more", label: t("moreTitle") },
    { href: "#promise", label: t("promiseTitle") }
  ];

  return (
    <main className="text-ink overflow-x-clip bg-[radial-gradient(circle_at_10%_-20%,rgba(24,183,189,.12),transparent_34%),radial-gradient(circle_at_95%_0%,rgba(228,185,103,.2),transparent_26%),var(--sand)]">
      <PageContainer spacing="comfortable" className="py-8 sm:py-12 lg:py-16">
        <article className="mx-auto grid w-full max-w-6xl gap-12 sm:gap-16 lg:gap-20">
          <header className="border-border relative isolate overflow-hidden rounded-[2rem] border bg-white shadow-[0_1.6rem_3.5rem_rgba(7,31,47,0.1)]">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden
              style={{
                background:
                  "linear-gradient(105deg, rgba(6,27,44,1) 0%, rgba(6,27,44,.96) 50%, rgba(6,27,44,.82) 100%)"
              }}
            />
            <div className="relative grid gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.85fr)] lg:gap-10 lg:px-12 lg:py-14">
              <div className="relative overflow-hidden rounded-[1.45rem] border border-white/20 bg-[linear-gradient(150deg,rgba(11,47,68,.62),rgba(2,16,31,.45))] p-6 text-white sm:p-8 lg:p-9">
                <div
                  className="pointer-events-none absolute inset-0 opacity-45"
                  aria-hidden
                  style={{
                    background:
                      "radial-gradient(circle at 14% 18%, rgba(24,183,189,.6), transparent 38%), radial-gradient(circle at 84% 14%, rgba(228,185,103,.45), transparent 34%)"
                  }}
                />
                <div className="relative z-1">
                  <SectionKicker light>{t("kicker")}</SectionKicker>
                  <h1 className="mt-5 max-w-[14ch] font-serif text-4xl leading-[0.96] sm:text-5xl lg:text-6xl">
                    {t("title")}
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/86 sm:text-lg">
                    {t("intro")}
                  </p>
                  <nav
                    className="mt-7 flex flex-wrap gap-2"
                    aria-label="About sections"
                  >
                    {heroAnchors.map((anchor, index) => (
                      <a
                        key={anchor.href}
                        href={anchor.href}
                        className={
                          index === 0
                            ? "button button-coral text-xs"
                            : "button button-light text-xs"
                        }
                      >
                        {anchor.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>

              <aside className="grid gap-4 self-stretch">
                <div className="rounded-[1.45rem] border border-white/18 bg-white/10 p-5 text-white backdrop-blur sm:p-6">
                  <p className="text-gold text-xs font-semibold tracking-[0.18em] uppercase">
                    {t("kicker")}
                  </p>
                  <p className="mt-3 font-serif text-2xl leading-tight sm:text-3xl">
                    {t("aheadTitle")}
                  </p>
                  <p className="mt-3 leading-relaxed text-white/82">
                    {t("aheadP1")}
                  </p>
                </div>
                <div className="grid gap-2 rounded-[1.45rem] border border-white/18 bg-[linear-gradient(160deg,rgba(255,255,255,.16),rgba(255,255,255,.04))] p-4 text-white sm:p-5">
                  <Badge
                    variant="outline"
                    className="w-fit border-white/30 text-white"
                  >
                    {t("promiseTitle")}
                  </Badge>
                  <ul className="mt-1 grid gap-2">
                    {promiseItems.slice(0, 3).map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm leading-relaxed text-white/84"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--gold)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </header>

          <section
            id="discover"
            className="grid scroll-mt-[calc(var(--shell-nav-height)+1rem)] gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,.88fr)] lg:gap-10"
          >
            <AboutPanel
              eyebrow={t("kicker")}
              index="01"
              title={t("discoverTitle")}
            >
              <p>{t("discoverP1")}</p>
              <p>{t("discoverP2")}</p>
            </AboutPanel>
            <AboutPanel
              eyebrow={t("kicker")}
              index="02"
              title={t("curatedTitle")}
              tone="soft"
            >
              <p>{t("curatedP1")}</p>
              <p>{t("curatedP2")}</p>
            </AboutPanel>
          </section>

          <section
            id="more"
            className="grid scroll-mt-[calc(var(--shell-nav-height)+1rem)] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
          >
            <AboutPanel title={t("moreTitle")} eyebrow={t("kicker")} index="03">
              <p>{t("moreP1")}</p>
              <p>{t("moreP2")}</p>
            </AboutPanel>

            <AboutPanel
              title={t("builtTitle")}
              tone="navy"
              eyebrow={t("kicker")}
              index="04"
            >
              <p>{t("builtP1")}</p>
              <p>{t("builtP2")}</p>
            </AboutPanel>
          </section>

          <section
            id="promise"
            className="grid scroll-mt-[calc(var(--shell-nav-height)+1rem)] gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start"
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[color:var(--border)] bg-[linear-gradient(165deg,rgba(255,253,248,1),rgba(237,246,246,.95))] p-6 shadow-[0_1.35rem_3rem_rgba(7,31,47,0.1)] sm:p-8 lg:p-10">
              <div
                className="pointer-events-none absolute inset-0 opacity-45"
                aria-hidden
                style={{
                  background:
                    "radial-gradient(circle at 8% 12%, rgba(24,183,189,.18), transparent 36%), radial-gradient(circle at 95% 90%, rgba(228,185,103,.14), transparent 32%)"
                }}
              />
              <div className="relative z-1">
                <SectionKicker>{t("promiseTitle")}</SectionKicker>
                <h2 className="text-navy mt-4 font-serif text-3xl leading-tight sm:text-4xl">
                  {t("promiseTitle")}
                </h2>
                <ul className="mt-6 grid gap-2.5">
                  {promiseItems.map((item, index) => (
                    <li
                      key={item}
                      className="group flex items-start gap-3 rounded-xl border border-white/70 bg-white/75 px-3.5 py-3 shadow-[0_.45rem_1.1rem_rgba(7,31,47,0.05)]"
                    >
                      <span
                        className="bg-coral mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full text-[.68rem] font-semibold text-white"
                        aria-hidden
                      >
                        {index + 1}
                      </span>
                      <span className="text-ink/85 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[1.75rem] border border-[color:var(--border)] bg-[linear-gradient(160deg,rgba(6,27,44,.97),rgba(6,27,44,.84))] px-6 py-7 text-white shadow-[0_1.25rem_3rem_rgba(7,31,47,0.24)] sm:px-8 sm:py-9 lg:px-10">
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                aria-hidden
                style={{
                  background:
                    "radial-gradient(circle at 13% 18%, rgba(24,183,189,.52), transparent 38%), radial-gradient(circle at 86% 12%, rgba(228,185,103,.36), transparent 30%)"
                }}
              />
              <div className="relative z-1">
                <Badge variant="outline" className="border-white/30 text-white">
                  {t("kicker")}
                </Badge>
                <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
                  {t("aheadTitle")}
                </h2>
                <p className="mt-4 leading-relaxed text-white/85">
                  {t("aheadP1")}
                </p>
                <p className="mt-4 leading-relaxed text-white/85">
                  {t("aheadP2")}
                </p>
                <p className="mt-4 leading-relaxed text-white/85">
                  {t("aheadP3")}
                </p>
                <p className="text-gold mt-5 font-semibold">
                  {t("aheadClosing")}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-navy relative isolate overflow-hidden rounded-[1.9rem] border border-white/15 p-6 text-white shadow-[0_1.4rem_3.2rem_rgba(7,31,47,0.24)] sm:p-8 lg:p-10">
            <div
              className="pointer-events-none absolute inset-0 opacity-45"
              aria-hidden
              style={{
                background:
                  "radial-gradient(circle at 8% 18%, rgba(24,183,189,.55), transparent 38%), radial-gradient(circle at 92% 80%, rgba(228,185,103,.3), transparent 34%), linear-gradient(160deg, rgba(6,27,44,.2), rgba(2,16,31,.5))"
              }}
            />
            <div className="relative z-1 grid gap-6 lg:grid-cols-[3.5rem_minmax(0,1fr)] lg:items-start lg:gap-7">
              <div className="text-gold flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/8 text-sm font-semibold tracking-[0.18em]">
                CP
              </div>
              <div>
                <SectionKicker light>{t("kicker")}</SectionKicker>
                <p className="mt-4 max-w-4xl font-serif text-2xl leading-tight text-white/92 sm:text-3xl">
                  {t("outro")}
                </p>
              </div>
            </div>
          </section>
        </article>
      </PageContainer>
    </main>
  );
}

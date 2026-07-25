"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import {
  ArrowRight,
  CalendarCheck,
  ChevronDown,
  Coffee,
  ExternalLink,
  Globe2,
  IceCreamBowl,
  Map,
  MapPin,
  Phone,
  QrCode,
  Search,
  Share2,
  SlidersHorizontal,
  Store,
  TrendingUp,
  Users,
  Utensils,
  Waves,
  X
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import type { ExperienceCardViewModel } from "@/lib/view-models/experience-card";
import {
  applyPartnerDirectoryFilters,
  parsePartnerDirectoryFilters,
  type PartnerDirectoryFilters,
  type PartnerSort
} from "@/lib/url/partner-directory-filters";
import { cn } from "@/lib/utils";
import { formatPartnerCategory } from "@/lib/view-models/partner-directory";
import type {
  PartnerDirectoryData,
  PartnerDirectoryItem
} from "@/lib/view-models/partner-directory";
import { PartnerCard } from "./partner-card";

const PartnerMapCanvas = dynamic(
  () =>
    import("./partner-map-canvas").then((module) => module.PartnerMapCanvas),
  {
    ssr: false,
    loading: () => <div className="bg-sand h-full min-h-96 animate-pulse" />
  }
);

type PartnerDirectoryShellProps = {
  data: PartnerDirectoryData;
  nearbyExperiences: ExperienceCardViewModel[];
  initialSearchParams: Record<string, string | string[] | undefined>;
  loadError: boolean;
  mapStyleUrl: string;
};

export function PartnerDirectoryShell({
  data,
  nearbyExperiences,
  initialSearchParams,
  loadError,
  mapStyleUrl
}: PartnerDirectoryShellProps) {
  const t = useTranslations("PartnerDirectory");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const current = useSearchParams();
  const [, startTransition] = useTransition();
  const [defaultDetailDismissed, setDefaultDetailDismissed] = useState(false);
  const filters = parsePartnerDirectoryFilters(
    current.size ? current : initialSearchParams
  );
  const items = useMemo(
    () => filterItems(data.items, filters),
    [data.items, filters]
  );
  const explicitSelection = items.find((item) => item.slug === filters.partner);
  const defaultSelection =
    items.find(
      (item) =>
        item.phone &&
        item.location.addressLine1 &&
        (item.websiteUrl || item.location.directionsUrl)
    ) ?? items[0];
  const selected =
    explicitSelection ?? (!defaultDetailDismissed ? defaultSelection : null);

  useEffect(() => {
    posthog.capture("partners_page_viewed", {
      partner_count: data.totals.partners
    });
  }, [data.totals.partners]);

  useEffect(() => {
    if (!filters.partner || !selected) return;
    document.getElementById(`partner-card-${selected.slug}`)?.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth"
    });
  }, [filters.partner, selected]);

  const patch = (next: Partial<PartnerDirectoryFilters>, event?: string) => {
    const params = applyPartnerDirectoryFilters(
      new URLSearchParams(current.toString()),
      next
    );
    if (event) posthog.capture(event, next);
    startTransition(() =>
      router.push(params.size ? `${pathname}?${params}` : pathname, {
        scroll: false
      })
    );
  };

  const select = (slug: string, event = "partner_card_selected") => {
    setDefaultDetailDismissed(false);
    patch({ partner: slug }, event);
  };
  const closeDetail = () => {
    setDefaultDetailDismissed(true);
    patch({ partner: null });
  };

  return (
    <main className="bg-background min-h-svh overflow-x-clip">
      <section className="border-border bg-sand/35 border-b">
        <WideContainer className="grid gap-5 py-6 lg:grid-cols-[minmax(21rem,1fr)_auto] lg:items-center">
          <div>
            <h1 className="text-navy max-w-xl font-serif text-4xl leading-[1.02] sm:text-5xl">
              {t.rich("title", {
                accent: (chunks) => (
                  <span className="text-turquoise block">{chunks}</span>
                )
              })}
            </h1>
            <p className="text-muted mt-3 max-w-xl text-sm leading-6">
              {t("description")}
            </p>
          </div>
          <dl className="border-border bg-panel grid grid-cols-3 rounded-xl border px-2 py-4 shadow-sm sm:px-4">
            <HeroMetric
              icon={<Users />}
              value={data.totals.partners}
              label={t("trustedPartners")}
              locale={locale}
            />
            <HeroMetric
              icon={<QrCode />}
              value={data.totals.scans}
              label={t("scans")}
              locale={locale}
            />
            <HeroMetric
              icon={<CalendarCheck />}
              value={data.totals.bookings}
              label={t("experienceBookings")}
              locale={locale}
            />
          </dl>
        </WideContainer>
      </section>

      <WideContainer className="py-4 pb-10">
        <DirectoryToolbar
          categories={data.categories}
          areas={data.areas}
          filters={filters}
          patch={patch}
        />

        {loadError ? (
          <ErrorState
            title={t("errorTitle")}
            description={t("errorDescription")}
            retryLabel={t("retry")}
            onRetry={() => router.refresh()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          >
            <button
              type="button"
              className="button button-outline"
              onClick={() =>
                patch({
                  category: null,
                  area: null,
                  featured: false,
                  query: null,
                  partner: null
                })
              }
            >
              {t("clearFilters")}
            </button>
          </EmptyState>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between xl:hidden">
              <p className="text-muted text-sm" aria-live="polite">
                {t("results", { count: items.length })}
              </p>
              <ViewToggle
                view={filters.view}
                onChange={(view) =>
                  patch({ view }, "partner_map_list_mode_changed")
                }
              />
            </div>

            <div className="border-border bg-panel grid min-h-0 overflow-hidden rounded-xl border shadow-[var(--shadow)] xl:grid-cols-[23rem_minmax(0,1fr)_23rem]">
              <section
                className={cn(
                  "bg-panel min-h-0 border-r",
                  filters.view === "map" ? "hidden xl:block" : ""
                )}
                aria-label={t("listLabel")}
              >
                <div className="border-border border-b p-3">
                  <label className="relative block">
                    <span className="sr-only">{t("search")}</span>
                    <Search
                      className="text-navy absolute top-1/2 left-3 size-4 -translate-y-1/2"
                      aria-hidden
                    />
                    <input
                      type="search"
                      value={filters.query ?? ""}
                      placeholder={t("searchPlaceholder")}
                      className="border-border min-h-11 w-full rounded-lg border bg-white pr-3 pl-9 text-sm"
                      onChange={(event) =>
                        patch({
                          query: event.target.value || null,
                          partner: null
                        })
                      }
                    />
                  </label>
                </div>
                <div className="max-h-[42rem] overflow-y-auto p-1.5">
                  <div className="grid gap-1.5">
                    {items.map((item) => (
                      <PartnerCard
                        key={item.id}
                        item={item}
                        selected={item.slug === selected?.slug}
                        onSelect={select}
                      />
                    ))}
                  </div>
                </div>
              </section>

              <section
                className={cn(
                  "bg-sand relative h-[34rem] min-h-[34rem] xl:h-[42rem] xl:min-h-[42rem]",
                  filters.view === "list" ? "hidden xl:block" : ""
                )}
                aria-label={t("mapLabel")}
              >
                <PartnerMapCanvas
                  items={items}
                  selectedSlug={selected?.slug ?? null}
                  onSelect={(slug) => select(slug, "partner_marker_selected")}
                  styleUrl={mapStyleUrl}
                />
              </section>

              {selected ? (
                <PartnerDetailPanel
                  item={selected}
                  nearbyExperiences={nearbyExperiences}
                  onClose={closeDetail}
                  className="hidden xl:flex"
                />
              ) : (
                <div className="bg-panel hidden xl:block" />
              )}
            </div>

            {selected ? (
              <PartnerDetailPanel
                item={selected}
                nearbyExperiences={nearbyExperiences}
                onClose={closeDetail}
                className="border-border mt-4 flex overflow-hidden rounded-xl border xl:hidden"
              />
            ) : null}
          </>
        )}

        <PartnerCallout />
      </WideContainer>
    </main>
  );
}

function DirectoryToolbar({
  categories,
  areas,
  filters,
  patch
}: {
  categories: string[];
  areas: string[];
  filters: PartnerDirectoryFilters;
  patch: (next: Partial<PartnerDirectoryFilters>, event?: string) => void;
}) {
  const t = useTranslations("PartnerDirectory");
  return (
    <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div
        className="flex max-w-full gap-2 overflow-x-auto pb-1"
        aria-label={t("category")}
      >
        <CategoryButton
          active={!filters.category}
          label={t("allPartners")}
          icon={<Users />}
          onClick={() =>
            patch({ category: null, partner: null }, "partner_filter_changed")
          }
        />
        {categories.map((category) => (
          <CategoryButton
            key={category}
            active={filters.category === category}
            label={formatPartnerCategory(category)}
            icon={categoryIcon(category)}
            onClick={() =>
              patch(
                {
                  category: filters.category === category ? null : category,
                  partner: null
                },
                "partner_filter_changed"
              )
            }
          />
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-3 lg:flex">
        <FilterSelect
          icon={<MapPin />}
          label={t("area")}
          value={filters.area ?? ""}
          onChange={(value) =>
            patch(
              { area: value || null, partner: null },
              "partner_filter_changed"
            )
          }
          options={areas.map((value) => ({ value, label: value }))}
          allLabel={t("allAreas")}
        />
        <FilterSelect
          icon={<TrendingUp />}
          label={t("sort")}
          value={filters.sort}
          onChange={(value) =>
            patch({ sort: value as PartnerSort }, "partner_filter_changed")
          }
          options={[
            ["bookings", t("sortBookings")],
            ["scans", t("sortScans")],
            ["conversion", t("sortConversion")],
            ["newest", t("sortNewest")],
            ["alphabetical", t("sortAlphabetical")]
          ].map(([value, label]) => ({ value, label }))}
        />
        <button
          type="button"
          className={cn(
            "border-border flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold",
            filters.featured ? "bg-navy text-white" : "bg-panel text-navy"
          )}
          aria-pressed={filters.featured}
          onClick={() =>
            patch(
              { featured: !filters.featured, partner: null },
              "partner_filter_changed"
            )
          }
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          {t("filters")}
        </button>
      </div>
    </div>
  );
}

function CategoryButton({
  active,
  label,
  icon,
  onClick
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "border-border flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-4 text-xs font-semibold",
        active ? "bg-navy text-white" : "bg-panel text-navy hover:bg-sand/50"
      )}
      aria-pressed={active}
      onClick={onClick}
    >
      <span className="[&>svg]:size-4">{icon}</span>
      {label}
    </button>
  );
}

function categoryIcon(category: string) {
  if (category.includes("beach")) return <Waves />;
  if (category.includes("ice")) return <IceCreamBowl />;
  if (category.includes("cafe")) return <Coffee />;
  if (category.includes("restaurant")) return <Utensils />;
  return <Store />;
}

function ViewToggle({
  view,
  onChange
}: {
  view: "map" | "list";
  onChange: (view: "map" | "list") => void;
}) {
  const t = useTranslations("PartnerDirectory");
  return (
    <div
      className="border-border bg-panel flex rounded-lg border p-1"
      role="group"
      aria-label={t("viewToggle")}
    >
      {(["list", "map"] as const).map((option) => (
        <button
          key={option}
          type="button"
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold",
            view === option ? "bg-navy text-white" : "text-navy"
          )}
          aria-pressed={view === option}
          onClick={() => onChange(option)}
        >
          {option === "map" ? (
            <Map className="size-4" aria-hidden />
          ) : (
            <Store className="size-4" aria-hidden />
          )}
          {option === "map" ? t("map") : t("list")}
        </button>
      ))}
    </div>
  );
}

function PartnerDetailPanel({
  item,
  nearbyExperiences,
  onClose,
  className
}: {
  item: PartnerDirectoryItem;
  nearbyExperiences: ExperienceCardViewModel[];
  onClose: () => void;
  className?: string;
}) {
  const t = useTranslations("PartnerDirectory");
  const locale = useLocale();
  const number = new Intl.NumberFormat(locale);
  const percent = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const tel = item.phone?.replace(/[^\d+]/g, "") ?? null;

  const share = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("partner", item.slug);
    if (navigator.share) {
      await navigator.share({ title: item.name, url: url.toString() });
    } else {
      await navigator.clipboard.writeText(url.toString());
    }
    posthog.capture("partner_detail_shared", { partner_id: item.id });
  };

  return (
    <aside
      className={cn("bg-panel min-h-0 flex-col", className)}
      aria-label={t("selectedPartner")}
    >
      <div className="bg-sand relative h-36 shrink-0 overflow-hidden">
        {item.image.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- canonical Supabase media URL
          <img
            src={item.image.url}
            alt={item.image.alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="from-navy-soft via-turquoise-deep to-navy flex h-full items-center justify-center bg-gradient-to-br text-white">
            <Store className="size-11 opacity-80" aria-hidden />
          </div>
        )}
        <button
          type="button"
          className="absolute top-2 right-2 grid size-11 place-items-center rounded-full bg-black/35 text-white backdrop-blur"
          onClick={onClose}
          aria-label={t("close")}
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="border-border relative border-b px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="border-border bg-panel -mt-10 grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border shadow-md">
            {item.logo.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- canonical Supabase media URL
              <img
                src={item.logo.url}
                alt={item.logo.alt}
                className="h-full w-full object-contain p-1.5"
              />
            ) : (
              <span className="text-navy font-serif text-lg" aria-hidden>
                {item.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-navy font-serif text-xl leading-tight">
              {item.name}
            </h2>
            <p className="text-muted mt-1 text-xs">
              {item.category
                ? formatPartnerCategory(item.category)
                : t("trustedPartner")}{" "}
              <span aria-hidden>•</span> {item.location.city}
            </p>
          </div>
        </div>
        <span className="bg-gold/20 text-navy mt-3 inline-flex rounded px-2 py-1 text-[0.6rem] font-bold tracking-wide uppercase">
          {item.isFeatured ? t("featured") : t("trustedPartner")}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <dl className="border-border grid grid-cols-3 divide-x border-b px-3 py-3">
          <DetailMetric
            icon={<QrCode />}
            value={number.format(item.metrics.scans)}
            label={t("scans")}
          />
          <DetailMetric
            icon={<CalendarCheck />}
            value={number.format(item.metrics.bookings)}
            label={t("bookings")}
          />
          <DetailMetric
            icon={<TrendingUp />}
            value={`${percent.format(item.metrics.conversionRate)}%`}
            label={t("conversion")}
          />
        </dl>

        <div className="space-y-4 p-4">
          {item.mostBookedExperience ? (
            <Link
              href={`/experiences/${item.mostBookedExperience.slug}`}
              className="border-border flex min-h-14 items-center justify-between rounded-lg border p-3"
            >
              <span className="min-w-0">
                <span className="text-muted block text-[0.65rem]">
                  {t("mostBooked")}
                </span>
                <span className="text-navy line-clamp-1 text-sm font-semibold">
                  {item.mostBookedExperience.name}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </Link>
          ) : (
            <div className="bg-sand/55 rounded-lg p-3">
              <p className="text-navy text-sm font-semibold">
                {t("noActivityTitle")}
              </p>
              <p className="text-muted mt-1 text-xs leading-5">
                {t("noBookingsYet")}
              </p>
            </div>
          )}

          {item.description ? (
            <p className="text-ink text-sm leading-5">{item.description}</p>
          ) : null}

          <address className="text-muted flex items-start gap-2 text-xs leading-5 not-italic">
            <MapPin
              className="text-turquoise mt-0.5 size-4 shrink-0"
              aria-hidden
            />
            <span>
              {item.location.addressLine1 ? (
                <span className="block">{item.location.addressLine1}</span>
              ) : null}
              <span>
                {[item.location.postalCode, item.location.city]
                  .filter(Boolean)
                  .join(" ")}
                {item.location.province ? `, ${item.location.province}` : ""}
              </span>
            </span>
          </address>

          <div className="grid grid-cols-2 gap-2">
            {item.websiteUrl ? (
              <a
                href={item.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="button button-navy min-h-11 justify-center text-xs"
              >
                <ExternalLink className="size-4" aria-hidden />
                {t("website")}
              </a>
            ) : null}
            {item.location.directionsUrl ? (
              <a
                href={item.location.directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="button button-outline min-h-11 justify-center text-xs"
                onClick={() =>
                  posthog.capture("partner_directions_clicked", {
                    partner_id: item.id
                  })
                }
              >
                <MapPin className="size-4" aria-hidden />
                {t("directions")}
              </a>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {item.websiteUrl ? (
              <SmallAction
                href={item.websiteUrl}
                label={t("website")}
                icon={<Globe2 />}
              />
            ) : null}
            {tel ? (
              <SmallAction
                href={`tel:${tel}`}
                label={t("call")}
                icon={<Phone />}
              />
            ) : null}
            <button
              type="button"
              className="border-border text-navy flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border text-[0.65rem] font-medium"
              onClick={() => void share().catch(() => undefined)}
            >
              <Share2 className="size-4" aria-hidden />
              {t("share")}
            </button>
          </div>
        </div>

        {nearbyExperiences.length ? (
          <div className="border-border border-t p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-navy text-sm font-semibold">
                {t("nearbyExperiences")}
              </h3>
              <Link
                href="/experiences"
                className="text-turquoise-deep text-xs font-semibold"
              >
                {t("seeAll")}
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {nearbyExperiences.slice(0, 3).map((experience) => (
                <Link
                  key={experience.id}
                  href={`/experiences/${experience.slug}`}
                  className="group min-w-0"
                >
                  <div className="bg-sand aspect-[4/3] overflow-hidden rounded-lg">
                    {experience.heroImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- canonical Supabase media URL
                      <img
                        src={experience.heroImageUrl}
                        alt={experience.heroImageAlt ?? experience.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="from-turquoise/35 to-navy-soft flex h-full items-center justify-center bg-gradient-to-br">
                        <Waves className="size-5 text-white" aria-hidden />
                      </div>
                    )}
                  </div>
                  <p className="text-navy mt-1 line-clamp-2 text-[0.65rem] leading-tight font-semibold">
                    {experience.title}
                  </p>
                  {experience.averageRating ? (
                    <p className="text-gold mt-1 text-[0.6rem]">
                      ★ {experience.averageRating.toFixed(1)}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function DetailMetric({
  icon,
  value,
  label
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="px-2 text-center">
      <dt className="text-navy flex items-center justify-center gap-1.5 text-sm font-semibold">
        <span className="text-turquoise [&>svg]:size-4">{icon}</span>
        {value}
      </dt>
      <dd className="text-muted mt-1 text-[0.58rem]">{label}</dd>
    </div>
  );
}

function SmallAction({
  href,
  label,
  icon
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="border-border text-navy flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border text-[0.65rem] font-medium"
    >
      <span className="[&>svg]:size-4">{icon}</span>
      {label}
    </a>
  );
}

function PartnerCallout() {
  const t = useTranslations("PartnerDirectory");
  const benefits = [
    ["benefitReach", <Users key="reach" />],
    ["benefitBookings", <QrCode key="bookings" />],
    ["benefitBenefits", <Store key="benefits" />],
    ["benefitFamily", <Waves key="family" />]
  ] as const;
  return (
    <section className="border-border bg-sand/35 mt-4 rounded-xl border px-5 py-5 sm:px-7">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h2 className="text-navy font-serif text-2xl">{t("becomeTitle")}</h2>
          <p className="text-muted mt-1 max-w-2xl text-sm leading-5">
            {t("becomeDescription")}
          </p>
        </div>
        <Link
          href="/contact?subject=partner"
          className="button button-navy min-h-12 justify-center px-7"
        >
          {t("partnerCta")}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(([key, icon]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="border-border text-navy grid size-10 shrink-0 place-items-center rounded-full border bg-white [&>svg]:size-4">
              {icon}
            </span>
            <p className="text-navy text-xs font-medium">{t(key)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HeroMetric({
  icon,
  value,
  label,
  locale
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  locale: string;
}) {
  return (
    <div className="border-border flex min-w-0 items-center gap-2 border-r px-2 last:border-r-0 sm:min-w-40 sm:px-4">
      <dt className="text-navy shrink-0 [&>svg]:size-6">{icon}</dt>
      <dd className="min-w-0">
        <span className="text-navy block font-serif text-xl font-semibold">
          {new Intl.NumberFormat(locale).format(value)}
        </span>
        <span className="text-muted block truncate text-[0.65rem]">
          {label}
        </span>
      </dd>
    </div>
  );
}

function FilterSelect({
  icon,
  label,
  value,
  onChange,
  options,
  allLabel
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  allLabel?: string;
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <span className="text-navy pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 [&>svg]:size-4">
        {icon}
      </span>
      <select
        className="border-border text-navy min-h-11 w-full appearance-none rounded-lg border bg-white pr-9 pl-9 text-xs font-medium lg:min-w-44"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {allLabel ? <option value="">{allLabel}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="text-navy pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
        aria-hidden
      />
    </label>
  );
}

function WideContainer({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Container
      className={cn(
        "w-[min(100%-1.25rem,92rem)] sm:w-[min(100%-2rem,92rem)]",
        className
      )}
    >
      {children}
    </Container>
  );
}

function filterItems(
  items: PartnerDirectoryItem[],
  filters: PartnerDirectoryFilters
) {
  const query = filters.query?.toLocaleLowerCase();
  return items
    .filter((item) => !filters.category || item.category === filters.category)
    .filter((item) => !filters.area || item.location.city === filters.area)
    .filter((item) => !filters.featured || item.isFeatured)
    .filter(
      (item) =>
        !query ||
        `${item.name} ${item.location.city} ${item.category ?? ""}`
          .toLocaleLowerCase()
          .includes(query)
    )
    .toSorted((a, b) => {
      if (filters.sort === "scans")
        return (
          b.metrics.scans - a.metrics.scans || a.name.localeCompare(b.name)
        );
      if (filters.sort === "conversion")
        return (
          b.metrics.conversionRate - a.metrics.conversionRate ||
          a.name.localeCompare(b.name)
        );
      if (filters.sort === "newest")
        return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
      if (filters.sort === "alphabetical") return a.name.localeCompare(b.name);
      return (
        b.metrics.bookings - a.metrics.bookings || a.name.localeCompare(b.name)
      );
    });
}

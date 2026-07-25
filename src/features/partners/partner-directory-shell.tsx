"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import {
  ArrowRight,
  ChevronDown,
  Coffee,
  ExternalLink,
  Globe2,
  IceCreamBowl,
  Map,
  MapPin,
  Phone,
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
  const router = useRouter();
  const pathname = usePathname();
  const current = useSearchParams();
  const [, startTransition] = useTransition();
  const [mapOpen, setMapOpen] = useState(false);
  const filters = parsePartnerDirectoryFilters(
    current.size ? current : initialSearchParams
  );
  const items = useMemo(
    () => filterItems(data.items, filters),
    [data.items, filters]
  );
  const selected = items.find((item) => item.slug === filters.partner) ?? null;

  useEffect(() => {
    posthog.capture("partners_page_viewed", {
      partner_count: data.totals.partners
    });
  }, [data.totals.partners]);

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
    patch({ partner: slug }, event);
  };

  const closeDetail = () => patch({ partner: null });

  return (
    <main className="bg-background min-h-svh overflow-x-clip">
      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(20,169,180,0.16),transparent_34%),linear-gradient(135deg,#f8f1e6_0%,#fffaf4_56%,#eef8f7_100%)]">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(180deg,rgba(2,28,43,0.08),transparent)] lg:block" />
        <WideContainer className="relative py-16 sm:py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-turquoise-deep text-xs font-semibold tracking-[0.22em] uppercase">
              {t("kicker")}
            </p>
            <h1 className="text-navy mt-4 max-w-2xl font-serif text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
              {t.rich("title", {
                accent: (chunks) => (
                  <span className="text-turquoise block">{chunks}</span>
                )
              })}
            </h1>
            <p className="text-muted mt-6 max-w-2xl text-base leading-7 sm:text-lg">
              {t("description")}
            </p>
          </div>
        </WideContainer>
      </section>

      <WideContainer className="py-10 sm:py-14 lg:py-16">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-[0_24px_80px_rgba(2,28,43,0.08)] backdrop-blur sm:p-6">
          <DirectoryToolbar
            categories={data.categories}
            areas={data.areas}
            filters={filters}
            patch={patch}
          />
        </div>

        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-turquoise-deep text-xs font-semibold tracking-[0.18em] uppercase">
              {t("trustedPartners")}
            </p>
            <h2 className="text-navy mt-2 font-serif text-3xl sm:text-4xl">
              {t("results", { count: items.length })}
            </h2>
          </div>
          <button
            type="button"
            className="button button-outline hidden items-center gap-2 sm:inline-flex"
            onClick={() => setMapOpen((value) => !value)}
            aria-expanded={mapOpen}
          >
            <Map className="size-4" aria-hidden />
            {t("map")}
          </button>
        </div>

        {loadError ? (
          <div className="mt-8">
            <ErrorState
              title={t("errorTitle")}
              description={t("errorDescription")}
              retryLabel={t("retry")}
              onRetry={() => router.refresh()}
            />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-8">
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
          </div>
        ) : (
          <>
            <section
              className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
              aria-label={t("listLabel")}
            >
              {items.map((item) => (
                <PartnerCard
                  key={item.id}
                  item={item}
                  selected={item.slug === selected?.slug}
                  onSelect={select}
                />
              ))}
            </section>

            <button
              type="button"
              className="button button-outline mt-8 flex w-full items-center justify-center gap-2 sm:hidden"
              onClick={() => setMapOpen((value) => !value)}
              aria-expanded={mapOpen}
            >
              <Map className="size-4" aria-hidden />
              {t("map")}
            </button>

            {mapOpen ? (
              <section className="mt-10 overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_28px_90px_rgba(2,28,43,0.12)]">
                <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-7">
                  <div>
                    <p className="text-turquoise-deep text-xs font-semibold tracking-[0.18em] uppercase">
                      {t("map")}
                    </p>
                    <h3 className="text-navy mt-1 font-serif text-2xl">
                      {t("mapLabel")}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="bg-sand text-navy flex size-10 items-center justify-center rounded-full"
                    onClick={() => setMapOpen(false)}
                    aria-label={t("close")}
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
                <div className="bg-sand h-[32rem]">
                  <PartnerMapCanvas
                    items={items}
                    selectedSlug={selected?.slug ?? null}
                    onSelect={(slug) => select(slug, "partner_marker_selected")}
                    styleUrl={mapStyleUrl}
                  />
                </div>
              </section>
            ) : null}
          </>
        )}

        <PartnerCallout />
      </WideContainer>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/55 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0"
            aria-label={t("close")}
            onClick={closeDetail}
          />
          <PartnerDetailPanel
            item={selected}
            nearbyExperiences={nearbyExperiences}
            onClose={closeDetail}
            className="relative z-10 flex max-h-[92svh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem]"
          />
        </div>
      ) : null}
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
    <div className="space-y-4">
      <label className="relative block">
        <span className="sr-only">{t("search")}</span>
        <Search
          className="text-navy absolute top-1/2 left-4 size-5 -translate-y-1/2"
          aria-hidden
        />
        <input
          type="search"
          value={filters.query ?? ""}
          placeholder={t("searchPlaceholder")}
          className="border-border min-h-14 w-full rounded-2xl border bg-white pr-4 pl-12 text-sm shadow-sm"
          onChange={(event) =>
            patch({
              query: event.target.value || null,
              partner: null
            })
          }
        />
      </label>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
              "border-border flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold",
              filters.featured ? "bg-navy text-white" : "bg-white text-navy"
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
        "flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
        active
          ? "border-navy bg-navy text-white"
          : "border-border bg-white text-navy hover:border-turquoise"
      )}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="[&>svg]:size-4">{icon}</span>
      {label}
    </button>
  );
}

function FilterSelect({
  icon,
  label,
  value,
  options,
  allLabel,
  onChange
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  allLabel?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="border-border bg-white text-navy relative flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold">
      <span className="[&>svg]:size-4">{icon}</span>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 appearance-none bg-transparent pr-5 outline-none"
      >
        {allLabel ? <option value="">{allLabel}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-3.5" />
    </label>
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

  return (
    <aside className={cn("flex-col", className)}>
      <div className="relative aspect-[16/7] overflow-hidden bg-sand">
        {item.image.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- canonical Supabase media URL
          <img
            src={item.image.url}
            alt={item.image.alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="from-navy-soft via-turquoise-deep to-navy h-full bg-gradient-to-br" />
        )}
        <button
          type="button"
          className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-navy shadow-lg backdrop-blur"
          onClick={onClose}
          aria-label={t("close")}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <div>
          <p className="text-turquoise-deep text-xs font-semibold tracking-[0.18em] uppercase">
            {item.category
              ? formatPartnerCategory(item.category)
              : t("trustedPartner")}
          </p>
          <h2 className="text-navy mt-2 font-serif text-4xl leading-tight">
            {item.name}
          </h2>
          <p className="text-muted mt-4 text-base leading-7">
            {item.description || t("noActivityTitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {item.websiteUrl ? (
            <a
              href={item.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="button button-primary inline-flex items-center gap-2"
            >
              <Globe2 className="size-4" aria-hidden />
              {t("website")}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          ) : null}
          {item.location.directionsUrl ? (
            <a
              href={item.location.directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="button button-outline inline-flex items-center gap-2"
            >
              <MapPin className="size-4" aria-hidden />
              {t("directions")}
            </a>
          ) : null}
          {item.phone ? (
            <a
              href={`tel:${item.phone}`}
              className="button button-outline inline-flex items-center gap-2"
            >
              <Phone className="size-4" aria-hidden />
              {t("call")}
            </a>
          ) : null}
          <button
            type="button"
            className="button button-outline inline-flex items-center gap-2"
            onClick={() => navigator.share?.({ title: item.name, url: window.location.href })}
          >
            <Share2 className="size-4" aria-hidden />
            {t("share")}
          </button>
        </div>

        <div className="border-border rounded-2xl border bg-sand/45 p-5">
          <p className="text-navy flex items-center gap-2 text-sm font-semibold">
            <MapPin className="text-turquoise size-4" aria-hidden />
            {item.location.addressLine1}
          </p>
          <p className="text-muted mt-1 text-sm">
            {[item.location.postalCode, item.location.city]
              .filter(Boolean)
              .join(" ")}
          </p>
        </div>

        {nearbyExperiences.length ? (
          <div>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-navy font-serif text-2xl">
                {t("nearbyExperiences")}
              </h3>
              <Link href="/experiences" className="text-navy text-sm font-semibold">
                {t("seeAll")}
              </Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {nearbyExperiences.map((experience) => (
                <Link
                  key={experience.slug}
                  href={`/experiences/${experience.slug}`}
                  className="border-border rounded-2xl border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <p className="text-navy line-clamp-2 font-serif text-lg leading-tight">
                    {experience.title}
                  </p>
                  <span className="text-turquoise-deep mt-3 inline-flex items-center gap-1 text-sm font-semibold">
                    {t("seeAll")}
                    <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function PartnerCallout() {
  const t = useTranslations("PartnerDirectory");
  return (
    <section className="from-navy to-navy-soft relative mt-16 overflow-hidden rounded-[2rem] bg-gradient-to-br p-8 text-white sm:p-10 lg:p-14">
      <div className="absolute -top-20 -right-20 size-64 rounded-full border border-white/10" />
      <div className="relative max-w-3xl">
        <p className="text-turquoise text-xs font-semibold tracking-[0.18em] uppercase">
          CostaPulse
        </p>
        <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
          {t("becomeTitle")}
        </h2>
        <p className="mt-4 max-w-2xl text-white/75 leading-7">
          {t("becomeDescription")}
        </p>
        <Link href="/contact" className="button button-primary mt-7 inline-flex items-center gap-2">
          {t("partnerCta")}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

function filterItems(
  items: PartnerDirectoryItem[],
  filters: PartnerDirectoryFilters
) {
  return applyPartnerDirectoryFilters(items, filters);
}

function categoryIcon(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("beach")) return <Waves />;
  if (normalized.includes("coffee") || normalized.includes("cafe")) return <Coffee />;
  if (normalized.includes("ice")) return <IceCreamBowl />;
  if (normalized.includes("restaurant")) return <Utensils />;
  return <Store />;
}

function WideContainer({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <Container className={cn("max-w-[90rem]", className)}>{children}</Container>;
}

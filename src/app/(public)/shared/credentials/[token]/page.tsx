import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  filterSharedCredentials,
  normalizeSharedCredentialFilters
} from "@/features/credentials/shared-filters";
import {
  formatCredentialCategory,
  formatCredentialComputedStatus,
  formatCredentialDocumentType,
  formatCredentialVerificationStatus
} from "@/features/credentials/labels";
import {
  CredentialPortfolioError,
  getSharedCredentialPortfolio
} from "@/server/repositories/credential-portal";

export const metadata = {
  title: "Shared Credential Portfolio",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

function humanDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

function statusBadgeClass(status: string): string {
  if (status === "valid")
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (status.startsWith("expires_within_")) {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }
  if (status === "expired") return "bg-rose-50 text-rose-800 border-rose-200";
  return "bg-[color:var(--panel)] text-[color:var(--muted)] border-[color:var(--border)]";
}

type SearchParams = Promise<{
  search?: string;
  documentType?: string;
  category?: string;
  validity?: string;
  verification?: string;
  recordState?: string;
}>;

type Props = {
  params: Promise<{ token: string }>;
  searchParams: SearchParams;
};

export default async function SharedCredentialPortalPage({
  params,
  searchParams
}: Props) {
  const { token } = await params;
  const [t, filters] = await Promise.all([
    getTranslations("CredentialPortal"),
    searchParams
  ]);
  const normalizedFilters = normalizeSharedCredentialFilters(filters);

  let portfolio: Awaited<
    ReturnType<typeof getSharedCredentialPortfolio>
  > | null = null;
  let unavailable = false;
  try {
    portfolio = await getSharedCredentialPortfolio(token);
  } catch (error) {
    if (error instanceof CredentialPortfolioError) {
      unavailable = true;
    } else {
      throw error;
    }
  }

  if (unavailable || !portfolio) {
    return (
      <main className="bg-panel min-h-svh bg-[radial-gradient(circle_at_10%_0%,rgba(24,183,189,0.22),transparent_34%),radial-gradient(circle_at_90%_16%,rgba(228,185,103,0.2),transparent_28%),linear-gradient(180deg,rgba(255,253,248,0.9),rgba(246,239,228,1))] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <div className="mx-auto w-full max-w-5xl">
          <section className="bg-navy relative isolate overflow-hidden rounded-[2rem] border border-white/12 p-7 text-white shadow-[0_1.8rem_3.8rem_rgba(7,31,47,0.28)] sm:p-10 lg:p-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-45"
              aria-hidden
              style={{
                background:
                  "radial-gradient(circle at 8% 12%, rgba(24,183,189,.58), transparent 30%), radial-gradient(circle at 88% 16%, rgba(228,185,103,.48), transparent 28%), repeating-linear-gradient(165deg, rgba(255,255,255,.06) 0 1px, transparent 1px 18px), linear-gradient(180deg, rgba(2,16,31,.12), rgba(2,16,31,.44))"
              }}
            />
            <div className="relative z-1 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,.9fr)] lg:items-stretch">
              <div className="min-w-0 self-center">
                <p className="text-gold text-xs font-semibold tracking-[0.16em] uppercase">
                  {t("sharedUnavailable.kicker")}
                </p>
                <h1 className="mt-4 max-w-3xl font-serif text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
                  {t("sharedUnavailable.title")}
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/84 sm:text-base">
                  {t("sharedUnavailable.description")}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="border-white/28 bg-white/8 text-white"
                  >
                    {t("headerTitle")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-white/28 bg-white/8 text-white/86"
                  >
                    {t("sharedKicker")}
                  </Badge>
                </div>
              </div>

              <aside className="rounded-[1.5rem] border border-white/16 bg-white/10 p-5 backdrop-blur-md sm:p-6">
                <p className="text-xs font-semibold tracking-[0.14em] text-white/74 uppercase">
                  {t("headerTitle")}
                </p>
                <h2 className="mt-2 font-serif text-2xl leading-tight text-white sm:text-3xl">
                  {t("sharedUnavailable.kicker")}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/86">
                  {t("sharedUnavailable.description")}
                </p>
                <div className="mt-6 rounded-xl border border-white/16 bg-[rgba(255,255,255,.08)] p-3 text-xs leading-relaxed text-white/78">
                  {t("shareExpires")} -
                </div>
              </aside>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const { documentType, category, validity, verification, recordState } =
    normalizedFilters;

  const availableDocumentTypes = Array.from(
    new Set(portfolio.credentials.map((item) => item.document_type))
  );
  const availableCategories = Array.from(
    new Set(portfolio.credentials.map((item) => item.category))
  );
  const availableVerifications = Array.from(
    new Set(portfolio.credentials.map((item) => item.verification_status))
  );

  const filteredCredentials = filterSharedCredentials(
    portfolio.credentials,
    filters
  );

  return (
    <main className="bg-panel min-h-svh bg-[radial-gradient(circle_at_15%_0%,rgba(24,183,189,0.14),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(228,185,103,0.15),transparent_26%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-7">
        <header className="bg-navy relative overflow-hidden rounded-3xl border border-white/10 p-6 text-white shadow-[0_1.25rem_3rem_rgba(7,31,47,0.24)] sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            aria-hidden
            style={{
              background:
                "radial-gradient(circle at 0% 0%, rgba(24,183,189,.5), transparent 28%), radial-gradient(circle at 80% 20%, rgba(228,185,103,.45), transparent 30%)"
            }}
          />
          <div className="relative z-1">
            <p className="text-xs font-semibold tracking-[0.16em] text-white/78 uppercase">
              {t("sharedKicker")}
            </p>
            <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
              {t("headerTitle")}
            </h1>
            <p className="mt-4 text-sm text-white/86 sm:text-base">
              {t("sharedWith")} {portfolio.recipient_email}
              {portfolio.recipient_agency_label
                ? ` · ${portfolio.recipient_agency_label}`
                : ""}
            </p>
            <p className="mt-2 text-sm text-white/78">
              {t("grantExpires")} {humanDate(portfolio.access_expires_at)}
            </p>
            <p className="mt-1 text-sm text-white/78">
              {t("shareExpires")}{" "}
              {humanDate(portfolio.share_expires_at ?? null)}
            </p>
          </div>
        </header>

        <section className="border-border rounded-3xl border bg-white/95 p-5 shadow-[0_1rem_2.5rem_rgba(7,31,47,0.08)] sm:p-6">
          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="grid gap-1.5 text-sm font-medium text-[color:var(--ink)]">
              {t("filters.search")}
              <Input
                name="search"
                defaultValue={filters.search ?? ""}
                className="min-h-11"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-[color:var(--ink)]">
              {t("filters.documentType")}
              <select
                name="documentType"
                defaultValue={documentType}
                className="border-border bg-card min-h-11 rounded-md border px-3"
              >
                <option value="all">{t("filters.all")}</option>
                {availableDocumentTypes.map((item) => (
                  <option key={item} value={item}>
                    {formatCredentialDocumentType(item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-[color:var(--ink)]">
              {t("filters.category")}
              <select
                name="category"
                defaultValue={category}
                className="border-border bg-card min-h-11 rounded-md border px-3"
              >
                <option value="all">{t("filters.all")}</option>
                {availableCategories.map((item) => (
                  <option key={item} value={item}>
                    {formatCredentialCategory(item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-[color:var(--ink)]">
              {t("filters.validity")}
              <select
                name="validity"
                defaultValue={validity}
                className="border-border bg-card min-h-11 rounded-md border px-3"
              >
                <option value="all">{t("filters.all")}</option>
                <option value="valid">
                  {formatCredentialComputedStatus(t, "valid")}
                </option>
                <option value="validity_unknown">
                  {formatCredentialComputedStatus(t, "validity_unknown")}
                </option>
                <option value="expires_within_180_days">
                  {formatCredentialComputedStatus(t, "expires_within_180_days")}
                </option>
                <option value="expires_within_90_days">
                  {formatCredentialComputedStatus(t, "expires_within_90_days")}
                </option>
                <option value="expires_within_60_days">
                  {formatCredentialComputedStatus(t, "expires_within_60_days")}
                </option>
                <option value="expires_within_30_days">
                  {formatCredentialComputedStatus(t, "expires_within_30_days")}
                </option>
                <option value="expired">
                  {formatCredentialComputedStatus(t, "expired")}
                </option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-[color:var(--ink)]">
              {t("filters.verification")}
              <select
                name="verification"
                defaultValue={verification}
                className="border-border bg-card min-h-11 rounded-md border px-3"
              >
                <option value="all">{t("filters.all")}</option>
                {availableVerifications.map((item) => (
                  <option key={item} value={item}>
                    {formatCredentialVerificationStatus(t, item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-[color:var(--ink)]">
              {t("filters.recordState")}
              <select
                name="recordState"
                defaultValue={recordState}
                className="border-border bg-card min-h-11 rounded-md border px-3"
              >
                <option value="all">{t("filters.all")}</option>
                <option value="current">{t("filters.current")}</option>
                <option value="historical">{t("filters.historical")}</option>
              </select>
            </label>
            <div className="flex items-end md:col-span-2 xl:col-span-3">
              <Button type="submit" className="min-h-11">
                {t("filters.apply")}
              </Button>
            </div>
          </form>
        </section>

        {filteredCredentials.length === 0 ? (
          <section className="border-border rounded-3xl border bg-white p-8 text-center shadow-[0_1rem_2.5rem_rgba(7,31,47,0.08)]">
            <h2 className="text-ink font-serif text-2xl sm:text-3xl">
              {portfolio.credentials.length === 0
                ? t("emptyShared.title")
                : t("empty.filteredTitle")}
            </h2>
            <p className="text-muted mx-auto mt-3 max-w-xl leading-relaxed">
              {portfolio.credentials.length === 0
                ? t("emptyShared.description")
                : t("empty.filteredDescription")}
            </p>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCredentials.map((credential) => (
              <Link
                key={credential.id}
                href={`/shared/credentials/${token}/${credential.id}`}
                className="border-border focus-visible:ring-turquoise group flex min-h-60 flex-col rounded-3xl border bg-white p-5 shadow-[0_1rem_2.5rem_rgba(7,31,47,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_1.4rem_2.8rem_rgba(7,31,47,0.14)] focus-visible:ring-2 focus-visible:outline-none"
              >
                <p className="text-muted text-xs font-semibold tracking-[0.14em] uppercase">
                  {formatCredentialDocumentType(credential.document_type)}
                </p>
                <h2 className="text-ink mt-2 text-xl leading-tight font-semibold group-hover:text-[color:var(--turquoise-deep)]">
                  {credential.title}
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={statusBadgeClass(credential.computed_status)}
                  >
                    {formatCredentialComputedStatus(
                      t,
                      credential.computed_status
                    )}
                  </Badge>
                  <Badge variant="muted">
                    {formatCredentialVerificationStatus(
                      t,
                      credential.verification_status
                    )}
                  </Badge>
                  <Badge variant="outline">
                    {formatCredentialCategory(credential.category)}
                  </Badge>
                </div>
                <dl className="text-muted mt-4 grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt>{t("card.issuer")}</dt>
                    <dd className="text-ink truncate text-right">
                      {credential.issuing_authority ?? "-"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>{t("card.expires")}</dt>
                    <dd className="text-ink text-right">
                      {credential.does_not_expire
                        ? t("card.noExpiry")
                        : humanDate(credential.expires_on)}
                    </dd>
                  </div>
                </dl>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

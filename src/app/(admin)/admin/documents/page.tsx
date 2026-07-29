import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionKicker } from "@/components/shared/section-kicker";
import { cn } from "@/lib/utils";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canAccessAdminSection } from "@/server/auth/role-access";
import {
  DOCUMENT_CATEGORY_VALUES,
  DOCUMENT_COMPUTED_STATUS_VALUES,
  DOCUMENT_CONFIDENTIALITY_VALUES,
  DOCUMENT_EXPIRY_FILTER_VALUES,
  DOCUMENT_SORT_VALUES,
  DOCUMENT_TYPE_VALUES,
  DOCUMENT_VERIFICATION_VALUES,
  fetchAdminDocumentsOverview,
  fetchAdminTeamMemberCertificates
} from "@/server/repositories/admin-documents";

export const metadata = {
  title: "Admin documents",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

function formatStatus(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function maskDocumentNumber(value: string | null): string {
  if (!value) return "-";
  const trimmed = value.trim();
  if (!trimmed) return "-";
  if (trimmed.length <= 4) return "*".repeat(trimmed.length);
  return `${"*".repeat(trimmed.length - 4)}${trimmed.slice(-4)}`;
}

function toSingleParam(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function firstCurrentFile(
  files: Array<{ id: string; is_current: boolean }> | undefined
) {
  if (!files || files.length === 0) return null;
  return files.find((file) => file.is_current) ?? files[0] ?? null;
}

function formatTeamMemberName(
  input: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null
): string {
  if (!input) {
    return "-";
  }

  if (input.display_name && input.display_name.trim()) {
    return input.display_name;
  }

  const fullName = `${input.first_name ?? ""} ${input.last_name ?? ""}`.trim();
  return fullName || "-";
}

const previewCardClass =
  "border-navy/10 bg-gradient-to-br from-white via-white to-sand/60 rounded-[var(--radius)] border p-4 shadow-[0_12px_30px_rgba(2,16,31,0.08)]";

const previewMetaRowClass = "flex justify-between gap-3 text-sm";
const previewMetaTermClass = "text-navy/70";
const previewMetaValueClass = "text-ink text-right font-medium";

const previewActionLinkClass =
  "text-navy hover:bg-coral hover:text-white inline-flex items-center rounded-md bg-navy/5 px-2.5 py-1 text-sm font-semibold transition-colors";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function normalizeFilterValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function toUtcMidnight(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function deriveCertificateComputedStatus(input: {
  status: string;
  doesNotExpire: boolean;
  expiresOn: string | null;
  now: Date;
}): string {
  if (["draft", "replaced", "revoked", "archived"].includes(input.status)) {
    return input.status;
  }

  if (input.status === "expired") {
    return "expired";
  }

  if (input.doesNotExpire) {
    return "valid";
  }

  if (!input.expiresOn) {
    return "validity_unknown";
  }

  const expiryDate = toUtcMidnight(input.expiresOn);
  if (!expiryDate) {
    return "validity_unknown";
  }

  const nowUtc = new Date(
    Date.UTC(
      input.now.getUTCFullYear(),
      input.now.getUTCMonth(),
      input.now.getUTCDate()
    )
  );

  const remainingDays = Math.floor(
    (expiryDate.getTime() - nowUtc.getTime()) / MS_PER_DAY
  );

  if (remainingDays < 0) {
    return "expired";
  }

  if (remainingDays <= 30) {
    return "expires_within_30_days";
  }

  if (remainingDays <= 60) {
    return "expires_within_60_days";
  }

  if (remainingDays <= 90) {
    return "expires_within_90_days";
  }

  if (remainingDays <= 180) {
    return "expires_within_180_days";
  }

  return "valid";
}

export default async function AdminDocumentsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const { roles } = await requireAreaAccess("admin");
  if (!canAccessAdminSection(roles, "documents")) {
    redirect("/admin?auth=forbidden");
  }

  const [t, params] = await Promise.all([
    getTranslations("Dashboards.admin"),
    searchParams
  ]);

  const search = toSingleParam(params.search);
  const type = toSingleParam(params.type);
  const category = toSingleParam(params.category);
  const computedStatus = toSingleParam(params.computed_status);
  const verification = toSingleParam(params.verification);
  const confidentiality = toSingleParam(params.confidentiality);
  const expiry = toSingleParam(params.expiry);
  const sort = toSingleParam(params.sort) ?? "updated_desc";

  const result = await fetchAdminDocumentsOverview({
    search,
    type: DOCUMENT_TYPE_VALUES.includes(
      type as (typeof DOCUMENT_TYPE_VALUES)[number]
    )
      ? (type as (typeof DOCUMENT_TYPE_VALUES)[number])
      : null,
    category: DOCUMENT_CATEGORY_VALUES.includes(
      category as (typeof DOCUMENT_CATEGORY_VALUES)[number]
    )
      ? (category as (typeof DOCUMENT_CATEGORY_VALUES)[number])
      : null,
    computedStatus: DOCUMENT_COMPUTED_STATUS_VALUES.includes(
      computedStatus as (typeof DOCUMENT_COMPUTED_STATUS_VALUES)[number]
    )
      ? (computedStatus as (typeof DOCUMENT_COMPUTED_STATUS_VALUES)[number])
      : null,
    verification: DOCUMENT_VERIFICATION_VALUES.includes(
      verification as (typeof DOCUMENT_VERIFICATION_VALUES)[number]
    )
      ? (verification as (typeof DOCUMENT_VERIFICATION_VALUES)[number])
      : null,
    confidentiality: DOCUMENT_CONFIDENTIALITY_VALUES.includes(
      confidentiality as (typeof DOCUMENT_CONFIDENTIALITY_VALUES)[number]
    )
      ? (confidentiality as (typeof DOCUMENT_CONFIDENTIALITY_VALUES)[number])
      : null,
    expiry: DOCUMENT_EXPIRY_FILTER_VALUES.includes(
      expiry as (typeof DOCUMENT_EXPIRY_FILTER_VALUES)[number]
    )
      ? (expiry as (typeof DOCUMENT_EXPIRY_FILTER_VALUES)[number])
      : null,
    sort: DOCUMENT_SORT_VALUES.includes(
      sort as (typeof DOCUMENT_SORT_VALUES)[number]
    )
      ? (sort as (typeof DOCUMENT_SORT_VALUES)[number])
      : "updated_desc"
  });

  const teamCertificates =
    result.status === "ok" && result.documents.length === 0
      ? await fetchAdminTeamMemberCertificates()
      : [];

  const isCertificateMode =
    result.status === "ok" && result.documents.length === 0;

  const certificateTypeValues = Array.from(
    new Set(teamCertificates.map((certificate) => certificate.certificate_type))
  ).sort((a, b) => a.localeCompare(b));

  const activeCertificateTypeFilter =
    type &&
    certificateTypeValues.some(
      (candidate) =>
        normalizeFilterValue(candidate) === normalizeFilterValue(type)
    )
      ? type
      : null;

  const activeComputedStatusFilter = DOCUMENT_COMPUTED_STATUS_VALUES.includes(
    computedStatus as (typeof DOCUMENT_COMPUTED_STATUS_VALUES)[number]
  )
    ? computedStatus
    : null;

  const activeVerificationFilter = DOCUMENT_VERIFICATION_VALUES.includes(
    verification as (typeof DOCUMENT_VERIFICATION_VALUES)[number]
  )
    ? verification
    : null;

  const activeExpiryFilter: (typeof DOCUMENT_EXPIRY_FILTER_VALUES)[number] =
    DOCUMENT_EXPIRY_FILTER_VALUES.includes(
      expiry as (typeof DOCUMENT_EXPIRY_FILTER_VALUES)[number]
    )
      ? (expiry as (typeof DOCUMENT_EXPIRY_FILTER_VALUES)[number])
      : "all";

  const teamCertificatesWithComputedStatus = teamCertificates.map(
    (certificate) => ({
      ...certificate,
      computed_status: deriveCertificateComputedStatus({
        status: certificate.status,
        doesNotExpire: certificate.does_not_expire,
        expiresOn: certificate.expires_on,
        now: new Date()
      })
    })
  );

  const filteredTeamCertificates = teamCertificatesWithComputedStatus
    .filter((certificate) => {
      if (activeCertificateTypeFilter) {
        const normalizedType = normalizeFilterValue(
          activeCertificateTypeFilter
        );
        if (
          normalizeFilterValue(certificate.certificate_type) !== normalizedType
        ) {
          return false;
        }
      }

      if (
        activeVerificationFilter &&
        certificate.verification_status !== activeVerificationFilter
      ) {
        return false;
      }

      if (
        activeComputedStatusFilter &&
        certificate.computed_status !== activeComputedStatusFilter
      ) {
        return false;
      }

      if (
        activeExpiryFilter === "expired" &&
        certificate.computed_status !== "expired"
      ) {
        return false;
      }

      if (
        activeExpiryFilter === "expiring" &&
        ![
          "expires_within_180_days",
          "expires_within_90_days",
          "expires_within_60_days",
          "expires_within_30_days"
        ].includes(certificate.computed_status)
      ) {
        return false;
      }

      if (
        activeExpiryFilter === "non_expiring" &&
        !certificate.does_not_expire
      ) {
        return false;
      }

      if (!search) {
        return true;
      }

      const lowerSearch = search.toLowerCase();
      const searchableNumber =
        certificate.certificate_number?.toLowerCase() ?? "";
      const searchableMaskedNumber = searchableNumber
        ? searchableNumber.length <= 4
          ? "*".repeat(searchableNumber.length)
          : `${"*".repeat(searchableNumber.length - 4)}${searchableNumber.slice(-4)}`
        : "";

      return (
        certificate.title.toLowerCase().includes(lowerSearch) ||
        (certificate.issuing_organization ?? "")
          .toLowerCase()
          .includes(lowerSearch) ||
        searchableNumber.includes(lowerSearch) ||
        searchableMaskedNumber.includes(lowerSearch) ||
        formatTeamMemberName(certificate.team_member)
          .toLowerCase()
          .includes(lowerSearch)
      );
    })
    .sort((a, b) => {
      const expiryA = a.expires_on ?? "9999-12-31";
      const expiryB = b.expires_on ?? "9999-12-31";

      switch (sort) {
        case "updated_asc":
          return a.updated_at.localeCompare(b.updated_at);
        case "expiry_asc":
          return expiryA.localeCompare(expiryB);
        case "expiry_desc":
          return expiryB.localeCompare(expiryA);
        case "updated_desc":
        default:
          return b.updated_at.localeCompare(a.updated_at);
      }
    });

  const certificateSummary = filteredTeamCertificates.reduce(
    (acc, certificate) => {
      switch (certificate.computed_status) {
        case "valid":
          acc.valid += 1;
          break;
        case "expires_within_180_days":
          acc.expiresWithin180Days += 1;
          break;
        case "expires_within_90_days":
          acc.expiresWithin90Days += 1;
          break;
        case "expires_within_60_days":
          acc.expiresWithin60Days += 1;
          break;
        case "expires_within_30_days":
          acc.expiresWithin30Days += 1;
          break;
        case "expired":
          acc.expired += 1;
          break;
        default:
          break;
      }

      if (certificate.verification_status === "pending") {
        acc.pendingVerification += 1;
      }

      return acc;
    },
    {
      valid: 0,
      expiresWithin180Days: 0,
      expiresWithin90Days: 0,
      expiresWithin60Days: 0,
      expiresWithin30Days: 0,
      expired: 0,
      pendingVerification: 0
    }
  );

  const displayedSummary =
    result.status === "ok"
      ? isCertificateMode
        ? certificateSummary
        : result.summary
      : {
          valid: 0,
          expiresWithin180Days: 0,
          expiresWithin90Days: 0,
          expiresWithin60Days: 0,
          expiresWithin30Days: 0,
          expired: 0,
          pendingVerification: 0
        };

  const displayedResultCount =
    result.status === "ok"
      ? isCertificateMode
        ? filteredTeamCertificates.length
        : result.filteredCount
      : 0;

  if (result.status === "unauthenticated") {
    redirect("/login?auth=required");
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionKicker>{t("kicker")}</SectionKicker>
          <h1 className="text-ink mt-2 text-3xl font-semibold">
            {t("documentsHeading")}
          </h1>
          <p className="text-muted mt-2 max-w-2xl">
            {t("documentsDescription")}
          </p>
        </div>
        <Link
          href="/admin/documents/new"
          className={cn(buttonVariants({ variant: "coral" }), "min-h-11")}
        >
          {t("documentsUpload")}
        </Link>
      </header>

      {result.status === "missing_config" ||
      result.status === "missing_profile" ? (
        <Alert variant="destructive">
          <AlertTitle>{t("documentsConfigErrorTitle")}</AlertTitle>
          <AlertDescription>
            {t("documentsConfigErrorDescription")}
          </AlertDescription>
        </Alert>
      ) : null}

      {result.status === "ok" ? (
        <>
          <form
            method="get"
            className="border-border grid gap-3 rounded-[var(--radius)] border bg-white p-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <input
              name="search"
              defaultValue={search ?? ""}
              placeholder={t("documentsFilterSearchPlaceholder")}
              className="border-border min-h-11 rounded-md border px-3 xl:col-span-2"
              aria-label={t("documentsFilterSearch")}
            />
            <select
              name="type"
              defaultValue={
                isCertificateMode
                  ? (activeCertificateTypeFilter ?? "")
                  : (type ?? "")
              }
              className="border-border min-h-11 rounded-md border px-3"
              aria-label={t("documentsTableType")}
            >
              <option value="">{t("documentsFilterAllTypes")}</option>
              {(isCertificateMode
                ? certificateTypeValues
                : DOCUMENT_TYPE_VALUES
              ).map((value) => (
                <option key={value} value={value}>
                  {formatStatus(value)}
                </option>
              ))}
            </select>
            {isCertificateMode ? null : (
              <select
                name="category"
                defaultValue={category ?? ""}
                className="border-border min-h-11 rounded-md border px-3"
                aria-label={t("documentsFilterCategory")}
              >
                <option value="">{t("documentsFilterAllCategories")}</option>
                {DOCUMENT_CATEGORY_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {formatStatus(value)}
                  </option>
                ))}
              </select>
            )}
            <select
              name="computed_status"
              defaultValue={activeComputedStatusFilter ?? ""}
              className="border-border min-h-11 rounded-md border px-3"
              aria-label={t("documentsTableStatus")}
            >
              <option value="">
                {t("documentsFilterAllComputedStatuses")}
              </option>
              {DOCUMENT_COMPUTED_STATUS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {formatStatus(value)}
                </option>
              ))}
            </select>
            <select
              name="verification"
              defaultValue={activeVerificationFilter ?? ""}
              className="border-border min-h-11 rounded-md border px-3"
              aria-label={t("documentsTableVerification")}
            >
              <option value="">{t("documentsFilterAllVerification")}</option>
              {DOCUMENT_VERIFICATION_VALUES.map((value) => (
                <option key={value} value={value}>
                  {formatStatus(value)}
                </option>
              ))}
            </select>
            {isCertificateMode ? null : (
              <select
                name="confidentiality"
                defaultValue={confidentiality ?? ""}
                className="border-border min-h-11 rounded-md border px-3"
                aria-label={t("documentsFilterConfidentiality")}
              >
                <option value="">
                  {t("documentsFilterAllConfidentiality")}
                </option>
                {DOCUMENT_CONFIDENTIALITY_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {formatStatus(value)}
                  </option>
                ))}
              </select>
            )}
            <select
              name="expiry"
              defaultValue={activeExpiryFilter}
              className="border-border min-h-11 rounded-md border px-3"
              aria-label={t("documentsFilterExpiry")}
            >
              {DOCUMENT_EXPIRY_FILTER_VALUES.map((value) => (
                <option key={value} value={value}>
                  {formatStatus(value)}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={sort}
              className="border-border min-h-11 rounded-md border px-3"
              aria-label={t("documentsFilterSort")}
            >
              {DOCUMENT_SORT_VALUES.map((value) => (
                <option key={value} value={value}>
                  {formatStatus(value)}
                </option>
              ))}
            </select>
            <div className="flex gap-2 sm:col-span-2 xl:col-span-4">
              <button
                type="submit"
                className="button button-coral min-h-11 px-4"
              >
                {t("documentsFilterApply")}
              </button>
              <Link
                href="/admin/documents"
                className="button button-outline inline-flex min-h-11 items-center px-4"
              >
                {t("documentsFilterClear")}
              </Link>
              <p className="text-muted self-center text-sm">
                {t("documentsFilterResults", { count: displayedResultCount })}
              </p>
            </div>
          </form>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <article className="rounded-[var(--radius)] border border-emerald-200/70 bg-gradient-to-br from-white via-white to-emerald-50/70 p-4 shadow-[0_10px_26px_rgba(6,27,44,0.08)]">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-2 rounded-full bg-emerald-500" />
                <p className="text-navy/70 text-[0.7rem] font-semibold tracking-[0.08em] uppercase">
                  {t("documentsSummaryValid")}
                </p>
              </div>
              <p className="text-navy mt-1 text-3xl leading-none font-semibold">
                {displayedSummary.valid}
              </p>
            </article>
            <article className="rounded-[var(--radius)] border border-teal-200/70 bg-gradient-to-br from-white via-white to-teal-50/70 p-4 shadow-[0_10px_26px_rgba(6,27,44,0.08)]">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-2 rounded-full bg-teal-500" />
                <p className="text-navy/70 text-[0.7rem] font-semibold tracking-[0.08em] uppercase">
                  {t("documentsSummaryExpiring180")}
                </p>
              </div>
              <p className="text-navy mt-1 text-3xl leading-none font-semibold">
                {displayedSummary.expiresWithin180Days}
              </p>
            </article>
            <article className="rounded-[var(--radius)] border border-cyan-200/70 bg-gradient-to-br from-white via-white to-cyan-50/70 p-4 shadow-[0_10px_26px_rgba(6,27,44,0.08)]">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-2 rounded-full bg-cyan-500" />
                <p className="text-navy/70 text-[0.7rem] font-semibold tracking-[0.08em] uppercase">
                  {t("documentsSummaryExpiring90")}
                </p>
              </div>
              <p className="text-navy mt-1 text-3xl leading-none font-semibold">
                {displayedSummary.expiresWithin90Days}
              </p>
            </article>
            <article className="rounded-[var(--radius)] border border-amber-200/70 bg-gradient-to-br from-white via-white to-amber-50/70 p-4 shadow-[0_10px_26px_rgba(6,27,44,0.08)]">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-2 rounded-full bg-amber-500" />
                <p className="text-navy/70 text-[0.7rem] font-semibold tracking-[0.08em] uppercase">
                  {t("documentsSummaryExpiring60")}
                </p>
              </div>
              <p className="text-navy mt-1 text-3xl leading-none font-semibold">
                {displayedSummary.expiresWithin60Days}
              </p>
            </article>
            <article className="rounded-[var(--radius)] border border-orange-200/70 bg-gradient-to-br from-white via-white to-orange-50/70 p-4 shadow-[0_10px_26px_rgba(6,27,44,0.08)]">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-2 rounded-full bg-orange-500" />
                <p className="text-navy/70 text-[0.7rem] font-semibold tracking-[0.08em] uppercase">
                  {t("documentsSummaryExpiring30")}
                </p>
              </div>
              <p className="text-navy mt-1 text-3xl leading-none font-semibold">
                {displayedSummary.expiresWithin30Days}
              </p>
            </article>
            <article className="rounded-[var(--radius)] border border-rose-200/70 bg-gradient-to-br from-white via-white to-rose-50/70 p-4 shadow-[0_10px_26px_rgba(6,27,44,0.08)]">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-2 rounded-full bg-rose-500" />
                <p className="text-navy/70 text-[0.7rem] font-semibold tracking-[0.08em] uppercase">
                  {t("documentsSummaryExpired")}
                </p>
              </div>
              <p className="text-navy mt-1 text-3xl leading-none font-semibold">
                {displayedSummary.expired}
              </p>
            </article>
            <article className="rounded-[var(--radius)] border border-violet-200/70 bg-gradient-to-br from-white via-white to-violet-50/70 p-4 shadow-[0_10px_26px_rgba(6,27,44,0.08)]">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-2 rounded-full bg-violet-500" />
                <p className="text-navy/70 text-[0.7rem] font-semibold tracking-[0.08em] uppercase">
                  {t("documentsSummaryPendingVerification")}
                </p>
              </div>
              <p className="text-navy mt-1 text-3xl leading-none font-semibold">
                {displayedSummary.pendingVerification}
              </p>
            </article>
          </div>

          {result.documents.length === 0 && teamCertificates.length === 0 ? (
            <EmptyState
              title={t("documentsFirstRunTitle")}
              description={t("documentsFirstRunDescription")}
              actionLabel={t("documentsFirstRunCta")}
              actionHref="/admin/documents/new"
            />
          ) : result.documents.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.documents.map((document) => {
                const currentFile = firstCurrentFile(document.files);

                return (
                  <li key={document.id} className={previewCardClass}>
                    <p className="text-navy bg-navy/10 inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase">
                      {formatStatus(document.document_type)}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold">
                      <Link
                        href={`/admin/documents/${document.id}`}
                        className="text-navy hover:text-coral underline-offset-4 transition-colors hover:underline"
                      >
                        {document.title}
                      </Link>
                    </h2>

                    <dl className="mt-3 space-y-2">
                      <div className={previewMetaRowClass}>
                        <dt className={previewMetaTermClass}>
                          {t("documentsTableMaskedNumber")}
                        </dt>
                        <dd className={previewMetaValueClass}>
                          {maskDocumentNumber(document.document_number)}
                        </dd>
                      </div>
                      <div className={previewMetaRowClass}>
                        <dt className={previewMetaTermClass}>
                          {t("documentsTableIssuer")}
                        </dt>
                        <dd className={previewMetaValueClass}>
                          {document.issuing_authority ?? "-"}
                        </dd>
                      </div>
                      <div className={previewMetaRowClass}>
                        <dt className={previewMetaTermClass}>
                          {t("documentsTableIssued")}
                        </dt>
                        <dd className={previewMetaValueClass}>
                          {formatDate(document.issued_on)}
                        </dd>
                      </div>
                      <div className={previewMetaRowClass}>
                        <dt className={previewMetaTermClass}>
                          {t("documentsTableExpiry")}
                        </dt>
                        <dd className={previewMetaValueClass}>
                          {document.does_not_expire
                            ? "-"
                            : formatDate(document.expires_on)}
                        </dd>
                      </div>
                      <div className={previewMetaRowClass}>
                        <dt className={previewMetaTermClass}>
                          {t("documentsTableFiles")}
                        </dt>
                        <dd className={previewMetaValueClass}>
                          {Array.isArray(document.files)
                            ? document.files.length
                            : 0}
                        </dd>
                      </div>
                      <div className={previewMetaRowClass}>
                        <dt className={previewMetaTermClass}>
                          {t("documentsTableUpdated")}
                        </dt>
                        <dd className={previewMetaValueClass}>
                          {formatDate(document.updated_at)}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="border-navy/20 text-navy bg-white"
                      >
                        {formatStatus(document.computed_status)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-turquoise/40 bg-turquoise/10 text-navy"
                      >
                        {formatStatus(document.verification_status)}
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/admin/documents/${document.id}`}
                        className={previewActionLinkClass}
                      >
                        {t("documentsActionView")}
                      </Link>
                      {currentFile ? (
                        <>
                          <Link
                            href={`/api/admin/documents/files/${currentFile.id}?intent=view`}
                            className={previewActionLinkClass}
                          >
                            {t("documentsActionPreview")}
                          </Link>
                          <Link
                            href={`/api/admin/documents/files/${currentFile.id}?intent=download`}
                            className={previewActionLinkClass}
                          >
                            {t("documentsActionDownload")}
                          </Link>
                        </>
                      ) : null}
                      <Link
                        href={`/admin/documents/${document.id}/edit`}
                        className={previewActionLinkClass}
                      >
                        {t("documentsActionEdit")}
                      </Link>
                      <Link
                        href={`/admin/documents/new?renewFrom=${document.id}`}
                        className={previewActionLinkClass}
                      >
                        {t("documentsActionRenew")}
                      </Link>
                      <Link
                        href={`/admin/documents/${document.id}/edit`}
                        className={previewActionLinkClass}
                      >
                        {t("documentsActionReplaceFile")}
                      </Link>
                      <Link
                        href={`/admin/documents/${document.id}/edit`}
                        className={previewActionLinkClass}
                      >
                        {t("documentsActionAddAttachment")}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTeamCertificates.map((certificate) => (
                <li key={certificate.id} className={previewCardClass}>
                  <p className="text-navy bg-navy/10 inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase">
                    {formatStatus(certificate.certificate_type)}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold">
                    <Link
                      href={`/admin/documents/certificates/${certificate.id}`}
                      className="text-navy hover:text-coral underline-offset-4 transition-colors hover:underline"
                    >
                      {certificate.title}
                    </Link>
                  </h2>

                  <dl className="mt-3 space-y-2">
                    <div className={previewMetaRowClass}>
                      <dt className={previewMetaTermClass}>
                        {t("documentsTableMaskedNumber")}
                      </dt>
                      <dd className={previewMetaValueClass}>
                        {maskDocumentNumber(certificate.certificate_number)}
                      </dd>
                    </div>
                    <div className={previewMetaRowClass}>
                      <dt className={previewMetaTermClass}>
                        {t("documentsTableIssuer")}
                      </dt>
                      <dd className={previewMetaValueClass}>
                        {certificate.issuing_organization ?? "-"}
                      </dd>
                    </div>
                    <div className={previewMetaRowClass}>
                      <dt className={previewMetaTermClass}>
                        {t("documentsTableIssued")}
                      </dt>
                      <dd className={previewMetaValueClass}>
                        {formatDate(certificate.issued_on)}
                      </dd>
                    </div>
                    <div className={previewMetaRowClass}>
                      <dt className={previewMetaTermClass}>
                        {t("documentsTableExpiry")}
                      </dt>
                      <dd className={previewMetaValueClass}>
                        {certificate.does_not_expire
                          ? "-"
                          : formatDate(certificate.expires_on)}
                      </dd>
                    </div>
                    <div className={previewMetaRowClass}>
                      <dt className={previewMetaTermClass}>
                        {t("documentsTableUpdated")}
                      </dt>
                      <dd className={previewMetaValueClass}>
                        {formatDate(certificate.updated_at)}
                      </dd>
                    </div>
                    <div className={previewMetaRowClass}>
                      <dt className={previewMetaTermClass}>
                        {t("documentsTableDocument")}
                      </dt>
                      <dd className={previewMetaValueClass}>
                        {formatTeamMemberName(certificate.team_member)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="border-navy/20 text-navy bg-white"
                    >
                      {formatStatus(certificate.status)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-turquoise/40 bg-turquoise/10 text-navy"
                    >
                      {formatStatus(certificate.verification_status)}
                    </Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/documents/certificates/${certificate.id}`}
                      className={previewActionLinkClass}
                    >
                      {t("documentsActionView")}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </section>
  );
}

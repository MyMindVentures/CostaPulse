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
  fetchAdminDocumentsOverview
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
              defaultValue={type ?? ""}
              className="border-border min-h-11 rounded-md border px-3"
              aria-label={t("documentsTableType")}
            >
              <option value="">{t("documentsFilterAllTypes")}</option>
              {DOCUMENT_TYPE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {formatStatus(value)}
                </option>
              ))}
            </select>
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
            <select
              name="computed_status"
              defaultValue={computedStatus ?? ""}
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
              defaultValue={verification ?? ""}
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
            <select
              name="confidentiality"
              defaultValue={confidentiality ?? ""}
              className="border-border min-h-11 rounded-md border px-3"
              aria-label={t("documentsFilterConfidentiality")}
            >
              <option value="">{t("documentsFilterAllConfidentiality")}</option>
              {DOCUMENT_CONFIDENTIALITY_VALUES.map((value) => (
                <option key={value} value={value}>
                  {formatStatus(value)}
                </option>
              ))}
            </select>
            <select
              name="expiry"
              defaultValue={expiry ?? "all"}
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
                {t("documentsFilterResults", { count: result.filteredCount })}
              </p>
            </div>
          </form>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <article className="border-border rounded-[var(--radius)] border bg-white p-4">
              <p className="text-muted text-xs">{t("documentsSummaryValid")}</p>
              <p className="text-ink mt-1 text-2xl font-semibold">
                {result.summary.valid}
              </p>
            </article>
            <article className="border-border rounded-[var(--radius)] border bg-white p-4">
              <p className="text-muted text-xs">
                {t("documentsSummaryExpiring180")}
              </p>
              <p className="text-ink mt-1 text-2xl font-semibold">
                {result.summary.expiresWithin180Days}
              </p>
            </article>
            <article className="border-border rounded-[var(--radius)] border bg-white p-4">
              <p className="text-muted text-xs">
                {t("documentsSummaryExpiring90")}
              </p>
              <p className="text-ink mt-1 text-2xl font-semibold">
                {result.summary.expiresWithin90Days}
              </p>
            </article>
            <article className="border-border rounded-[var(--radius)] border bg-white p-4">
              <p className="text-muted text-xs">
                {t("documentsSummaryExpiring60")}
              </p>
              <p className="text-ink mt-1 text-2xl font-semibold">
                {result.summary.expiresWithin60Days}
              </p>
            </article>
            <article className="border-border rounded-[var(--radius)] border bg-white p-4">
              <p className="text-muted text-xs">
                {t("documentsSummaryExpiring30")}
              </p>
              <p className="text-ink mt-1 text-2xl font-semibold">
                {result.summary.expiresWithin30Days}
              </p>
            </article>
            <article className="border-border rounded-[var(--radius)] border bg-white p-4">
              <p className="text-muted text-xs">
                {t("documentsSummaryExpired")}
              </p>
              <p className="text-ink mt-1 text-2xl font-semibold">
                {result.summary.expired}
              </p>
            </article>
            <article className="border-border rounded-[var(--radius)] border bg-white p-4">
              <p className="text-muted text-xs">
                {t("documentsSummaryPendingVerification")}
              </p>
              <p className="text-ink mt-1 text-2xl font-semibold">
                {result.summary.pendingVerification}
              </p>
            </article>
          </div>

          {result.documents.length === 0 ? (
            <EmptyState
              title={t("documentsFirstRunTitle")}
              description={t("documentsFirstRunDescription")}
              actionLabel={t("documentsFirstRunCta")}
              actionHref="/admin/documents/new"
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[70rem] text-left text-sm">
                  <thead className="text-muted border-border border-b">
                    <tr>
                      <th className="px-2 py-3">
                        {t("documentsTableDocument")}
                      </th>
                      <th className="px-2 py-3">{t("documentsTableType")}</th>
                      <th className="px-2 py-3">
                        {t("documentsTableMaskedNumber")}
                      </th>
                      <th className="px-2 py-3">{t("documentsTableIssuer")}</th>
                      <th className="px-2 py-3">{t("documentsTableIssued")}</th>
                      <th className="px-2 py-3">{t("documentsTableExpiry")}</th>
                      <th className="px-2 py-3">{t("documentsTableStatus")}</th>
                      <th className="px-2 py-3">
                        {t("documentsTableVerification")}
                      </th>
                      <th className="px-2 py-3">{t("documentsTableFiles")}</th>
                      <th className="px-2 py-3">
                        {t("documentsTableUpdated")}
                      </th>
                      <th className="px-2 py-3">
                        {t("documentsTableActions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.documents.map((document) => (
                      <tr
                        key={document.id}
                        className="border-border border-b align-top"
                      >
                        <td className="px-2 py-3 font-medium">
                          {document.title}
                        </td>
                        <td className="px-2 py-3">
                          {formatStatus(document.document_type)}
                        </td>
                        <td className="px-2 py-3">
                          {maskDocumentNumber(document.document_number)}
                        </td>
                        <td className="px-2 py-3">
                          {document.issuing_authority ?? "-"}
                        </td>
                        <td className="px-2 py-3">
                          {formatDate(document.issued_on)}
                        </td>
                        <td className="px-2 py-3">
                          {document.does_not_expire
                            ? "-"
                            : formatDate(document.expires_on)}
                        </td>
                        <td className="px-2 py-3">
                          <Badge variant="outline">
                            {formatStatus(document.computed_status)}
                          </Badge>
                        </td>
                        <td className="px-2 py-3">
                          <Badge variant="outline">
                            {formatStatus(document.verification_status)}
                          </Badge>
                        </td>
                        <td className="px-2 py-3">
                          {Array.isArray(document.files)
                            ? document.files.length
                            : 0}
                        </td>
                        <td className="px-2 py-3">
                          {formatDate(document.updated_at)}
                        </td>
                        <td className="px-2 py-3">
                          {(() => {
                            const currentFile = firstCurrentFile(
                              document.files
                            );
                            return (
                              <div className="flex flex-wrap gap-2">
                                <Link
                                  href={`/admin/documents/${document.id}`}
                                  className="text-sm font-medium underline-offset-4 hover:underline"
                                >
                                  {t("documentsActionView")}
                                </Link>
                                {currentFile ? (
                                  <>
                                    <Link
                                      href={`/api/admin/documents/files/${currentFile.id}?intent=view`}
                                      className="text-sm font-medium underline-offset-4 hover:underline"
                                    >
                                      {t("documentsActionPreview")}
                                    </Link>
                                    <Link
                                      href={`/api/admin/documents/files/${currentFile.id}?intent=download`}
                                      className="text-sm font-medium underline-offset-4 hover:underline"
                                    >
                                      {t("documentsActionDownload")}
                                    </Link>
                                  </>
                                ) : null}
                                <Link
                                  href={`/admin/documents/${document.id}/edit`}
                                  className="text-sm font-medium underline-offset-4 hover:underline"
                                >
                                  {t("documentsActionEdit")}
                                </Link>
                                <Link
                                  href={`/admin/documents/new?renewFrom=${document.id}`}
                                  className="text-sm font-medium underline-offset-4 hover:underline"
                                >
                                  {t("documentsActionRenew")}
                                </Link>
                                <Link
                                  href={`/admin/documents/${document.id}/edit`}
                                  className="text-sm font-medium underline-offset-4 hover:underline"
                                >
                                  {t("documentsActionReplaceFile")}
                                </Link>
                                <Link
                                  href={`/admin/documents/${document.id}/edit`}
                                  className="text-sm font-medium underline-offset-4 hover:underline"
                                >
                                  {t("documentsActionAddAttachment")}
                                </Link>
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="grid gap-3 lg:hidden">
                {result.documents.map((document) => (
                  <li
                    key={document.id}
                    className="border-border rounded-[var(--radius)] border bg-white p-4"
                  >
                    <p className="text-muted text-xs font-semibold uppercase">
                      {formatStatus(document.document_type)}
                    </p>
                    <h2 className="text-ink mt-1 text-lg font-semibold">
                      {document.title}
                    </h2>
                    <p className="text-muted mt-1 text-sm">
                      {t("documentsTableMaskedNumber")}:{" "}
                      {maskDocumentNumber(document.document_number)}
                    </p>
                    <p className="text-muted text-sm">
                      {t("documentsTableIssuer")}:{" "}
                      {document.issuing_authority ?? "-"}
                    </p>
                    <p className="text-muted text-sm">
                      {t("documentsTableIssued")}:{" "}
                      {formatDate(document.issued_on)}
                    </p>
                    <p className="text-muted text-sm">
                      {t("documentsTableExpiry")}:{" "}
                      {document.does_not_expire
                        ? "-"
                        : formatDate(document.expires_on)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {formatStatus(document.computed_status)}
                      </Badge>
                      <Badge variant="outline">
                        {formatStatus(document.verification_status)}
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4">
                      <Link
                        href={`/admin/documents/${document.id}`}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                      >
                        {t("documentsActionView")}
                      </Link>
                      {(() => {
                        const currentFile = firstCurrentFile(document.files);
                        if (!currentFile) return null;

                        return (
                          <>
                            <Link
                              href={`/api/admin/documents/files/${currentFile.id}?intent=view`}
                              className="text-sm font-medium underline-offset-4 hover:underline"
                            >
                              {t("documentsActionPreview")}
                            </Link>
                            <Link
                              href={`/api/admin/documents/files/${currentFile.id}?intent=download`}
                              className="text-sm font-medium underline-offset-4 hover:underline"
                            >
                              {t("documentsActionDownload")}
                            </Link>
                          </>
                        );
                      })()}
                      <Link
                        href={`/admin/documents/${document.id}/edit`}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                      >
                        {t("documentsActionEdit")}
                      </Link>
                      <Link
                        href={`/admin/documents/new?renewFrom=${document.id}`}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                      >
                        {t("documentsActionRenew")}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : null}
    </section>
  );
}

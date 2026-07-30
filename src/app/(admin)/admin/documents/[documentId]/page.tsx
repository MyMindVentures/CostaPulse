import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProtectedFilePreview } from "@/components/shared/protected-file-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionKicker } from "@/components/shared/section-kicker";
import { requireAreaAccess } from "@/server/auth/protected-area";
import {
  canAccessAdminSection,
  canMutateAdminOpsContent
} from "@/server/auth/role-access";
import { setProfessionalDocumentVerificationAction } from "@/server/documents/actions";
import { fetchAdminDocumentDetail } from "@/server/repositories/admin-documents";

export const metadata = {
  title: "Document detail",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ documentId: string }>;
  searchParams: Promise<{ status?: string; message?: string }>;
};

const detailPanelClass =
  "border-navy/10 bg-gradient-to-br from-white via-white to-sand/60 relative overflow-hidden rounded-2xl border p-5 shadow-[0_14px_34px_rgba(2,16,31,0.08)]";

const detailMetaItemClass =
  "border-navy/10 rounded-xl border bg-white/85 p-3 shadow-[0_6px_16px_rgba(2,16,31,0.04)]";

const detailMetaItemWideClass = `${detailMetaItemClass} md:col-span-2`;

const detailMetaTermClass =
  "text-navy/70 text-xs font-semibold tracking-[0.08em] uppercase";

const detailMetaValueClass = "text-ink mt-1 text-sm font-semibold leading-6";

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

export default async function AdminDocumentDetailPage({
  params,
  searchParams
}: Props) {
  const { roles } = await requireAreaAccess("admin");
  if (!canAccessAdminSection(roles, "documents")) {
    redirect("/admin?auth=forbidden");
  }

  const t = await getTranslations("Dashboards.admin");
  const [{ documentId }, query] = await Promise.all([params, searchParams]);
  const result = await fetchAdminDocumentDetail(documentId);

  if (result.status === "unauthenticated") {
    redirect("/login?auth=required");
  }

  if (result.status === "not_found") {
    notFound();
  }

  if (
    result.status === "missing_config" ||
    result.status === "missing_profile"
  ) {
    redirect("/admin/documents?auth=configuration_error");
  }

  if (result.status !== "ok") {
    return null;
  }

  const document = result.document;
  const canVerify = canMutateAdminOpsContent(roles);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/documents"
          className="text-muted text-sm underline underline-offset-4"
        >
          {t("documentsBackToOverview")}
        </Link>
        <SectionKicker>{t("kicker")}</SectionKicker>
        <h1 className="text-ink mt-2 text-3xl font-semibold">
          {document.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">
            {formatStatus(document.computed_status)}
          </Badge>
          <Badge variant="outline">
            {formatStatus(document.verification_status)}
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/admin/documents/new?renewFrom=${document.id}`}>
            <Button type="button" variant="outline">
              {t("documentsActionRenew")}
            </Button>
          </Link>
          {canVerify ? (
            <>
              <form action={setProfessionalDocumentVerificationAction}>
                <input type="hidden" name="documentId" value={document.id} />
                <input
                  type="hidden"
                  name="verificationStatus"
                  value="verified"
                />
                <Button type="submit" variant="outline">
                  {t("documentsMarkVerified")}
                </Button>
              </form>
              <form action={setProfessionalDocumentVerificationAction}>
                <input type="hidden" name="documentId" value={document.id} />
                <input
                  type="hidden"
                  name="verificationStatus"
                  value="rejected"
                />
                <Button type="submit" variant="outline">
                  {t("documentsMarkRejected")}
                </Button>
              </form>
              <form action={setProfessionalDocumentVerificationAction}>
                <input type="hidden" name="documentId" value={document.id} />
                <input
                  type="hidden"
                  name="verificationStatus"
                  value="pending"
                />
                <Button type="submit" variant="light">
                  {t("documentsMarkPending")}
                </Button>
              </form>
            </>
          ) : null}
        </div>
      </div>

      {query.status === "verification_updated" ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {t("documentsVerificationUpdated")}
        </p>
      ) : null}

      {query.status === "error" && query.message ? (
        <p className="border-coral bg-coral/10 text-ink rounded-md border px-4 py-3 text-sm">
          {query.message}
        </p>
      ) : null}

      <div className={detailPanelClass}>
        <div
          aria-hidden
          className="bg-gold/12 pointer-events-none absolute -top-14 -right-10 h-40 w-40 rounded-full blur-2xl"
        />
        <div
          aria-hidden
          className="bg-turquoise/12 pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full blur-2xl"
        />
        <dl className="relative grid gap-3 sm:gap-4 md:grid-cols-2">
          <div className={detailMetaItemClass}>
            <dt className={detailMetaTermClass}>{t("documentsTableType")}</dt>
            <dd className={detailMetaValueClass}>
              {formatStatus(document.document_type)}
            </dd>
          </div>
          <div className={detailMetaItemClass}>
            <dt className={detailMetaTermClass}>{t("documentsTableIssuer")}</dt>
            <dd className={detailMetaValueClass}>
              {document.issuing_authority ?? "-"}
            </dd>
          </div>
          <div className={detailMetaItemClass}>
            <dt className={detailMetaTermClass}>{t("documentsTableExpiry")}</dt>
            <dd className={detailMetaValueClass}>
              {formatDate(document.expires_on)}
            </dd>
          </div>
          <div className={detailMetaItemClass}>
            <dt className={detailMetaTermClass}>
              {t("documentsDetailIssued")}
            </dt>
            <dd className={detailMetaValueClass}>
              {formatDate(document.issued_on)}
            </dd>
          </div>
          <div className={detailMetaItemClass}>
            <dt className={detailMetaTermClass}>
              {t("documentsDetailIssuingCountry")}
            </dt>
            <dd className={detailMetaValueClass}>
              {document.issuing_country_code ?? "-"}
            </dd>
          </div>
          <div className={detailMetaItemClass}>
            <dt className={detailMetaTermClass}>
              {t("documentsDetailQualification")}
            </dt>
            <dd className={detailMetaValueClass}>
              {document.qualification ?? "-"}
            </dd>
          </div>
          <div className={detailMetaItemClass}>
            <dt className={detailMetaTermClass}>
              {t("documentsDetailStcwCode")}
            </dt>
            <dd className={detailMetaValueClass}>
              {document.stcw_code ?? "-"}
            </dd>
          </div>
          <div className={detailMetaItemClass}>
            <dt className={detailMetaTermClass}>
              {t("documentsDetailRestrictions")}
            </dt>
            <dd className={detailMetaValueClass}>
              {document.restrictions ?? "-"}
            </dd>
          </div>
          <div className={detailMetaItemWideClass}>
            <dt className={detailMetaTermClass}>{t("documentsDetailNotes")}</dt>
            <dd
              className={`${detailMetaValueClass} break-words whitespace-pre-wrap`}
            >
              {document.notes ?? "-"}
            </dd>
          </div>
          <div className={detailMetaItemWideClass}>
            <dt className={detailMetaTermClass}>
              {t("documentsDetailReplaces")}
            </dt>
            <dd className={`${detailMetaValueClass} break-all`}>
              {document.replaces_document_id ? (
                <Link
                  href={`/admin/documents/${document.replaces_document_id}`}
                  className="text-navy hover:text-coral inline-flex min-h-11 items-center font-semibold underline underline-offset-4 transition-colors"
                >
                  {document.replaces_document_id}
                </Link>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div className={detailMetaItemClass}>
            <dt className={detailMetaTermClass}>
              {t("documentsTableUpdated")}
            </dt>
            <dd className={detailMetaValueClass}>
              {formatDate(document.updated_at)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="border-border rounded-2xl border bg-white p-5">
        <h2 className="text-ink text-xl font-semibold">
          {t("documentsTableFiles")}
        </h2>
        {document.files.length === 0 ? (
          <p className="text-muted mt-2 text-sm">-</p>
        ) : (
          <ul className="mt-3 grid gap-5">
            {document.files.map((file) => {
              const fileLabel = file.original_filename ?? "file";
              const viewHref = `/api/admin/documents/files/${file.id}?intent=view`;
              const downloadHref = `/api/admin/documents/files/${file.id}?intent=download`;

              return (
                <li
                  key={file.id}
                  className="border-border min-w-0 rounded-xl border bg-white p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-ink text-sm font-medium break-all">
                        {fileLabel}
                      </p>
                      <p className="text-muted mt-1 text-xs">
                        {formatStatus(file.file_role)} · {file.mime_type} ·{" "}
                        {Math.ceil(file.file_size_bytes / 1024)} KB · v
                        {file.version_number}
                      </p>
                    </div>
                    <div className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <a
                        href={viewHref}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ink hover:text-coral inline-flex min-h-11 items-center font-medium underline underline-offset-4 transition-colors"
                      >
                        {t("documentsActionPreview")}
                      </a>
                      <a
                        href={downloadHref}
                        className="text-ink hover:text-coral inline-flex min-h-11 items-center font-medium underline underline-offset-4 transition-colors"
                      >
                        {t("documentsActionDownload")}
                      </a>
                      <Link
                        href={`/admin/documents/${document.id}/edit`}
                        className="text-ink hover:text-coral inline-flex min-h-11 items-center font-medium underline underline-offset-4 transition-colors"
                      >
                        {t("documentsActionEdit")}
                      </Link>
                    </div>
                  </div>

                  <div className="border-border bg-sand/20 mt-3 overflow-hidden rounded-lg border">
                    <ProtectedFilePreview
                      fileId={file.id}
                      fileName={fileLabel}
                      mimeType={file.mime_type}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
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

      <div className="border-border rounded-2xl border bg-white p-5">
        <dl className="grid gap-3 md:grid-cols-2">
          <div>
            <dt className="text-muted text-xs uppercase">
              {t("documentsTableType")}
            </dt>
            <dd className="text-ink mt-1">
              {formatStatus(document.document_type)}
            </dd>
          </div>
          <div>
            <dt className="text-muted text-xs uppercase">
              {t("documentsTableIssuer")}
            </dt>
            <dd className="text-ink mt-1">
              {document.issuing_authority ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-muted text-xs uppercase">
              {t("documentsTableExpiry")}
            </dt>
            <dd className="text-ink mt-1">{formatDate(document.expires_on)}</dd>
          </div>
          <div>
            <dt className="text-muted text-xs uppercase">
              {t("documentsDetailIssued")}
            </dt>
            <dd className="text-ink mt-1">{formatDate(document.issued_on)}</dd>
          </div>
          <div>
            <dt className="text-muted text-xs uppercase">
              {t("documentsDetailIssuingCountry")}
            </dt>
            <dd className="text-ink mt-1">
              {document.issuing_country_code ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-muted text-xs uppercase">
              {t("documentsDetailQualification")}
            </dt>
            <dd className="text-ink mt-1">{document.qualification ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-muted text-xs uppercase">
              {t("documentsDetailStcwCode")}
            </dt>
            <dd className="text-ink mt-1">{document.stcw_code ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-muted text-xs uppercase">
              {t("documentsDetailRestrictions")}
            </dt>
            <dd className="text-ink mt-1">{document.restrictions ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-muted text-xs uppercase">
              {t("documentsDetailNotes")}
            </dt>
            <dd className="text-ink mt-1">{document.notes ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-muted text-xs uppercase">
              {t("documentsDetailReplaces")}
            </dt>
            <dd className="text-ink mt-1">
              {document.replaces_document_id ? (
                <Link
                  href={`/admin/documents/${document.replaces_document_id}`}
                  className="underline underline-offset-4"
                >
                  {document.replaces_document_id}
                </Link>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-muted text-xs uppercase">
              {t("documentsTableUpdated")}
            </dt>
            <dd className="text-ink mt-1">{formatDate(document.updated_at)}</dd>
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
          <ul className="mt-3 grid gap-3">
            {document.files.map((file) => (
              <li
                key={file.id}
                className="border-border flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
              >
                <div>
                  <p className="text-ink text-sm font-medium">
                    {formatStatus(file.file_role)} · v{file.version_number}
                  </p>
                  <p className="text-muted text-xs">
                    {file.original_filename ?? "file"} ·
                  </p>
                  <p className="text-muted text-xs">
                    {file.mime_type} · {Math.ceil(file.file_size_bytes / 1024)}{" "}
                    KB
                  </p>
                </div>
                <div className="flex gap-4">
                  <Link
                    href={`/api/admin/documents/files/${file.id}?intent=view`}
                    className="text-sm font-medium underline-offset-4 hover:underline"
                  >
                    Preview
                  </Link>
                  <Link
                    href={`/api/admin/documents/files/${file.id}?intent=download`}
                    className="text-sm font-medium underline-offset-4 hover:underline"
                  >
                    Download
                  </Link>
                  <Link
                    href={`/admin/documents/${document.id}/edit`}
                    className="text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {t("documentsActionEdit")}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

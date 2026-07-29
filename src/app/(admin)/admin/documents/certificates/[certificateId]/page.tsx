import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProtectedFilePreview } from "@/components/shared/protected-file-preview";
import { SectionKicker } from "@/components/shared/section-kicker";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canAccessAdminSection } from "@/server/auth/role-access";
import {
  deleteCertificateFileAction,
  uploadCertificateFileAction
} from "@/server/documents/actions";
import { fetchAdminTeamMemberCertificateDetail } from "@/server/repositories/admin-documents";

export const metadata = {
  title: "Certificate detail",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ certificateId: string }>;
  searchParams: Promise<{ status?: string; message?: string }>;
};

const detailPanelClass =
  "border-navy/10 bg-gradient-to-br from-white via-white to-sand/60 rounded-2xl border p-5 shadow-[0_14px_34px_rgba(2,16,31,0.08)]";

const detailMetaTermClass = "text-navy/70 text-xs uppercase";
const detailMetaValueClass = "text-ink mt-1 font-medium";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Math.ceil(kb)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

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

function formatTeamMemberName(
  input: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null
): string {
  if (!input) return "-";
  if (input.display_name && input.display_name.trim()) {
    return input.display_name;
  }

  const fullName = `${input.first_name ?? ""} ${input.last_name ?? ""}`.trim();
  return fullName || "-";
}

export default async function AdminCertificateDetailPage({
  params,
  searchParams
}: Props) {
  const { roles } = await requireAreaAccess("admin");
  if (!canAccessAdminSection(roles, "documents")) {
    redirect("/admin?auth=forbidden");
  }

  const t = await getTranslations("Dashboards.admin");
  const [{ certificateId }, query] = await Promise.all([params, searchParams]);
  const certificate =
    await fetchAdminTeamMemberCertificateDetail(certificateId);

  if (!certificate) {
    notFound();
  }

  const linkedFiles = certificate.linked_documents.flatMap((document) =>
    document.files.map((file) => ({
      ...file,
      source_document_id: document.id,
      source_document_title: document.title
    }))
  );

  return (
    <section className="flex flex-col gap-6">
      <div className={detailPanelClass}>
        <Link
          href="/admin/documents"
          className="text-navy/80 hover:text-coral text-sm font-medium underline underline-offset-4 transition-colors"
        >
          {t("documentsBackToOverview")}
        </Link>
        <SectionKicker>{t("kicker")}</SectionKicker>
        <h1 className="text-navy mt-2 text-3xl font-semibold">
          {certificate.title}
        </h1>
        <p className="text-navy/75 mt-2 text-sm">
          {formatTeamMemberName(certificate.team_member)}
        </p>
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
          <Badge
            variant="outline"
            className="border-gold/50 bg-gold/15 text-navy"
          >
            {formatStatus(certificate.certificate_type)}
          </Badge>
        </div>
      </div>

      <div className={detailPanelClass}>
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className={detailMetaTermClass}>
              {t("documentsTableMaskedNumber")}
            </dt>
            <dd className={detailMetaValueClass}>
              {certificate.certificate_number ?? "-"}
            </dd>
          </div>
          <div>
            <dt className={detailMetaTermClass}>{t("documentsTableIssuer")}</dt>
            <dd className={detailMetaValueClass}>
              {certificate.issuing_organization ?? "-"}
            </dd>
          </div>
          <div>
            <dt className={detailMetaTermClass}>{t("documentsTableIssued")}</dt>
            <dd className={detailMetaValueClass}>
              {formatDate(certificate.issued_on)}
            </dd>
          </div>
          <div>
            <dt className={detailMetaTermClass}>{t("documentsTableExpiry")}</dt>
            <dd className={detailMetaValueClass}>
              {certificate.does_not_expire
                ? "-"
                : formatDate(certificate.expires_on)}
            </dd>
          </div>
          <div>
            <dt className={detailMetaTermClass}>Valid from</dt>
            <dd className={detailMetaValueClass}>
              {formatDate(certificate.valid_from)}
            </dd>
          </div>
          <div>
            <dt className={detailMetaTermClass}>
              {t("documentsTableUpdated")}
            </dt>
            <dd className={detailMetaValueClass}>
              {formatDate(certificate.updated_at)}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className={detailMetaTermClass}>Description</dt>
            <dd className={detailMetaValueClass}>
              {certificate.description ?? "-"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className={detailMetaTermClass}>Skills</dt>
            <dd className={detailMetaValueClass}>
              {certificate.skills.length > 0
                ? certificate.skills.join(", ")
                : "-"}
            </dd>
          </div>
          <div>
            <dt className={detailMetaTermClass}>Credential URL</dt>
            <dd className={`${detailMetaValueClass} break-all`}>
              {certificate.credential_url ? (
                <a
                  href={certificate.credential_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-navy hover:text-coral underline underline-offset-4 transition-colors"
                >
                  {certificate.credential_url}
                </a>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className={detailMetaTermClass}>Verification URL</dt>
            <dd className={`${detailMetaValueClass} break-all`}>
              {certificate.verification_url ? (
                <a
                  href={certificate.verification_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-navy hover:text-coral underline underline-offset-4 transition-colors"
                >
                  {certificate.verification_url}
                </a>
              ) : (
                "-"
              )}
            </dd>
          </div>
        </dl>
      </div>

      {query.status === "file_uploaded" ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Bestand is succesvol geupload.
        </p>
      ) : null}

      {query.status === "file_deleted" ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Bestand is verwijderd.
        </p>
      ) : null}

      {query.status === "error" && query.message ? (
        <p className="border-coral bg-coral/10 text-ink rounded-md border px-4 py-3 text-sm">
          {query.message}
        </p>
      ) : null}

      <div className={detailPanelClass}>
        <h2 className="text-navy text-xl font-semibold">Document preview</h2>
        <p className="text-navy/70 mt-1 text-sm">
          Bekijk gekoppelde certificaatbestanden direct in de pagina.
        </p>

        <form
          action={uploadCertificateFileAction}
          className="border-navy/10 mt-4 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-[minmax(10rem,12rem)_minmax(0,1fr)_auto]"
        >
          <input type="hidden" name="certificateId" value={certificate.id} />

          <label className="flex flex-col gap-1 text-sm">
            File role
            <select
              name="fileRole"
              className="border-navy/20 min-h-11 rounded-md border px-3"
              defaultValue="primary"
              required
            >
              <option value="primary">primary</option>
              <option value="front">front</option>
              <option value="back">back</option>
              <option value="translation">translation</option>
              <option value="attachment">attachment</option>
              <option value="supporting_evidence">supporting evidence</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Bestand
            <input
              type="file"
              name="file"
              className="border-navy/20 min-h-11 rounded-md border px-3 py-2"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              required
            />
          </label>

          <div className="flex items-end">
            <Button type="submit" className="min-h-11">
              Upload
            </Button>
          </div>
        </form>

        {linkedFiles.length === 0 ? (
          <p className="text-ink/80 mt-4 text-sm">
            Er zijn nog geen gekoppelde bestanden voor dit certificaat.
          </p>
        ) : (
          <ul className="mt-4 grid gap-5">
            {linkedFiles.map((file) => {
              const fileLabel = file.original_filename ?? "file";
              const viewHref = `/api/admin/documents/files/${file.id}?intent=view`;
              const downloadHref = `/api/admin/documents/files/${file.id}?intent=download`;

              return (
                <li
                  key={file.id}
                  className="border-navy/10 rounded-xl border bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-ink text-sm font-semibold break-all">
                        {fileLabel}
                      </p>
                      <p className="text-navy/70 mt-1 text-xs">
                        {file.file_role.replaceAll("_", " ")} · {file.mime_type}{" "}
                        · {formatFileSize(file.file_size_bytes)} · v
                        {file.version_number}
                        {file.is_current ? " · current" : ""}
                      </p>
                      <p className="text-navy/70 mt-1 text-xs">
                        Bron document: {file.source_document_title}
                      </p>
                    </div>
                    <div className="flex min-h-11 items-center gap-4 text-sm">
                      <a
                        href={viewHref}
                        target="_blank"
                        rel="noreferrer"
                        className="text-navy hover:text-coral underline underline-offset-4 transition-colors"
                      >
                        Open
                      </a>
                      <a
                        href={downloadHref}
                        className="text-navy hover:text-coral underline underline-offset-4 transition-colors"
                      >
                        Download
                      </a>
                      <form action={deleteCertificateFileAction}>
                        <input
                          type="hidden"
                          name="certificateId"
                          value={certificate.id}
                        />
                        <input type="hidden" name="fileId" value={file.id} />
                        <button
                          type="submit"
                          className="text-coral hover:text-navy underline underline-offset-4 transition-colors"
                        >
                          Verwijder
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="border-navy/10 bg-sand/20 mt-3 overflow-hidden rounded-lg border">
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

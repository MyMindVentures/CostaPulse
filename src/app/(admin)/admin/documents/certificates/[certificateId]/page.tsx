import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { SectionKicker } from "@/components/shared/section-kicker";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canAccessAdminSection } from "@/server/auth/role-access";
import { fetchAdminTeamMemberCertificateDetail } from "@/server/repositories/admin-documents";

export const metadata = {
  title: "Certificate detail",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ certificateId: string }>;
};

const detailPanelClass =
  "border-navy/10 bg-gradient-to-br from-white via-white to-sand/60 rounded-2xl border p-5 shadow-[0_14px_34px_rgba(2,16,31,0.08)]";

const detailMetaTermClass = "text-navy/70 text-xs uppercase";
const detailMetaValueClass = "text-ink mt-1 font-medium";

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

export default async function AdminCertificateDetailPage({ params }: Props) {
  const { roles } = await requireAreaAccess("admin");
  if (!canAccessAdminSection(roles, "documents")) {
    redirect("/admin?auth=forbidden");
  }

  const t = await getTranslations("Dashboards.admin");
  const { certificateId } = await params;
  const certificate =
    await fetchAdminTeamMemberCertificateDetail(certificateId);

  if (!certificate) {
    notFound();
  }

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
    </section>
  );
}

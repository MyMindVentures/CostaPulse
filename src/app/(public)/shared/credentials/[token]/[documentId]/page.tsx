import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatCredentialComputedStatus,
  formatCredentialDocumentType,
  formatCredentialFileRole,
  formatCredentialVerificationStatus
} from "@/features/credentials/labels";
import {
  CredentialPortfolioError,
  getSharedCredentialPortfolio
} from "@/server/repositories/credential-portal";

export const metadata = {
  title: "Shared Credential Detail",
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

type Props = {
  params: Promise<{ token: string; documentId: string }>;
};

export default async function SharedCredentialDetailPage({ params }: Props) {
  const t = await getTranslations("CredentialPortal");
  const { token, documentId } = await params;

  let portfolio;
  try {
    portfolio = await getSharedCredentialPortfolio(token);
  } catch (error) {
    if (error instanceof CredentialPortfolioError) {
      notFound();
    }
    throw error;
  }

  const credential = portfolio.credentials.find(
    (item) => item.id === documentId
  );
  if (!credential) {
    notFound();
  }

  const canDownload = portfolio.permissions.canDownloadFiles;

  return (
    <main className="bg-panel min-h-svh bg-[radial-gradient(circle_at_15%_0%,rgba(24,183,189,0.14),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(228,185,103,0.15),transparent_26%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Link
          href={`/shared/credentials/${token}`}
          className="text-muted hover:text-ink text-sm underline underline-offset-4"
        >
          {t("detail.backToSharedCredentials")}
        </Link>

        <section className="border-border rounded-3xl border bg-white p-6 shadow-[0_1rem_2.5rem_rgba(7,31,47,0.08)] sm:p-8">
          <p className="text-muted text-xs font-semibold tracking-[0.16em] uppercase">
            {formatCredentialDocumentType(credential.document_type)}
          </p>
          <h1 className="text-ink mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
            {credential.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline">
              {formatCredentialComputedStatus(t, credential.computed_status)}
            </Badge>
            <Badge variant="muted">
              {formatCredentialVerificationStatus(
                t,
                credential.verification_status
              )}
            </Badge>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                {t("detail.issuingAuthority")}
              </dt>
              <dd className="text-ink mt-1">
                {credential.issuing_authority ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                {t("detail.country")}
              </dt>
              <dd className="text-ink mt-1">
                {credential.issuing_country_code ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                {t("detail.issued")}
              </dt>
              <dd className="text-ink mt-1">
                {humanDate(credential.issued_on)}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                {t("detail.expires")}
              </dt>
              <dd className="text-ink mt-1">
                {credential.does_not_expire
                  ? t("card.noExpiry")
                  : humanDate(credential.expires_on)}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                {t("detail.status")}
              </dt>
              <dd className="text-ink mt-1">
                {formatCredentialComputedStatus(t, credential.computed_status)}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                {t("detail.verification")}
              </dt>
              <dd className="text-ink mt-1">
                {formatCredentialVerificationStatus(
                  t,
                  credential.verification_status
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                {t("detail.documentNumber")}
              </dt>
              <dd className="text-ink mt-1">
                {credential.document_number ?? "-"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="border-border rounded-3xl border bg-white p-6 shadow-[0_1rem_2.5rem_rgba(7,31,47,0.08)] sm:p-8">
          <h2 className="text-ink text-xl font-semibold">
            {t("detail.files")}
          </h2>
          {credential.files.length === 0 ? (
            <p className="text-muted mt-2 leading-relaxed">
              {t("detail.noFiles")}
            </p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {credential.files.map((file) => (
                <li
                  key={file.id}
                  className="border-border rounded-2xl border bg-[color:var(--panel)]/35 px-4 py-4"
                >
                  <Badge variant="outline">
                    {formatCredentialFileRole(t, file.file_role)}
                  </Badge>
                  <p className="text-muted mt-1 text-sm">
                    {file.original_filename}
                  </p>
                  <p className="text-muted mt-1 text-xs">
                    {file.mime_type} · v{file.version_number}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <Button asChild variant="outline" className="min-h-10 px-4">
                      <a
                        href={`/api/shared/credentials/${token}/files/${file.id}?intent=view`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("detail.openFile")}
                      </a>
                    </Button>
                    {canDownload ? (
                      <Button asChild variant="light" className="min-h-10 px-4">
                        <a
                          href={`/api/shared/credentials/${token}/files/${file.id}?intent=download`}
                        >
                          {t("detail.downloadFile")}
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

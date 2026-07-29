import Link from "next/link";
import { notFound } from "next/navigation";
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
    <main className="bg-panel min-h-svh px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Link
          href={`/shared/credentials/${token}`}
          className="text-muted text-sm underline underline-offset-4"
        >
          Back to shared credentials
        </Link>

        <section className="border-border rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-muted text-xs font-semibold tracking-[0.16em] uppercase">
            {credential.document_type.replaceAll("_", " ")}
          </p>
          <h1 className="text-ink mt-2 text-3xl font-semibold tracking-tight">
            {credential.title}
          </h1>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                Issuing authority
              </dt>
              <dd className="text-ink mt-1">
                {credential.issuing_authority ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                Country
              </dt>
              <dd className="text-ink mt-1">
                {credential.issuing_country_code ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                Issued
              </dt>
              <dd className="text-ink mt-1">
                {humanDate(credential.issued_on)}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                Expires
              </dt>
              <dd className="text-ink mt-1">
                {credential.does_not_expire
                  ? "Does not expire"
                  : humanDate(credential.expires_on)}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                Status
              </dt>
              <dd className="text-ink mt-1">
                {credential.computed_status.replaceAll("_", " ")}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                Verification
              </dt>
              <dd className="text-ink mt-1">
                {credential.verification_status.replaceAll("_", " ")}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                Document number
              </dt>
              <dd className="text-ink mt-1">
                {credential.document_number ?? "-"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="border-border rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-ink text-xl font-semibold">Files</h2>
          {credential.files.length === 0 ? (
            <p className="text-muted mt-2">
              No files are available for this credential.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {credential.files.map((file) => (
                <li
                  key={file.id}
                  className="border-border rounded-2xl border px-4 py-3"
                >
                  <p className="text-ink text-sm font-semibold">
                    {file.file_role.replaceAll("_", " ")}
                  </p>
                  <p className="text-muted mt-1 text-sm">
                    {file.original_filename}
                  </p>
                  <p className="text-muted mt-1 text-xs">
                    {file.mime_type} · v{file.version_number}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    <a
                      href={`/api/shared/credentials/${token}/files/${file.id}?intent=view`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink underline underline-offset-2"
                    >
                      Open file
                    </a>
                    {canDownload ? (
                      <a
                        href={`/api/shared/credentials/${token}/files/${file.id}?intent=download`}
                        className="text-ink underline underline-offset-2"
                      >
                        Download file
                      </a>
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

import Link from "next/link";
import { notFound } from "next/navigation";
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

type Props = {
  params: Promise<{ token: string }>;
};

export default async function SharedCredentialPortalPage({ params }: Props) {
  const { token } = await params;

  let portfolio;
  try {
    portfolio = await getSharedCredentialPortfolio(token);
  } catch (error) {
    if (error instanceof CredentialPortfolioError) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="bg-panel min-h-svh px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="border-border rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-muted text-xs font-semibold tracking-[0.16em] uppercase">
            Secure shared credentials
          </p>
          <h1 className="text-ink mt-2 text-3xl font-semibold tracking-tight">
            Professional credentials
          </h1>
          <p className="text-muted mt-3 text-sm sm:text-base">
            Shared with: {portfolio.recipient_email}
            {portfolio.recipient_agency_label
              ? ` · ${portfolio.recipient_agency_label}`
              : ""}
          </p>
          <p className="text-muted mt-2 text-sm">
            Grant expires: {humanDate(portfolio.access_expires_at)}
          </p>
          <p className="text-muted mt-1 text-sm">
            Share expires: {humanDate(portfolio.share_expires_at ?? null)}
          </p>
        </header>

        {portfolio.credentials.length === 0 ? (
          <section className="border-border rounded-3xl border bg-white p-8 text-center shadow-sm">
            <h2 className="text-ink text-xl font-semibold">
              No credentials available
            </h2>
            <p className="text-muted mt-2">
              This share currently has no available credentials.
            </p>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {portfolio.credentials.map((credential) => (
              <Link
                key={credential.id}
                href={`/shared/credentials/${token}/${credential.id}`}
                className="border-border focus-visible:ring-turquoise flex min-h-56 flex-col rounded-3xl border bg-white p-5 shadow-sm transition hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
              >
                <p className="text-muted text-xs font-semibold tracking-[0.14em] uppercase">
                  {credential.document_type.replaceAll("_", " ")}
                </p>
                <h2 className="text-ink mt-2 text-xl leading-tight font-semibold">
                  {credential.title}
                </h2>
                <dl className="text-muted mt-4 grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt>Issuer</dt>
                    <dd className="text-ink truncate text-right">
                      {credential.issuing_authority ?? "-"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>Expires</dt>
                    <dd className="text-ink text-right">
                      {credential.does_not_expire
                        ? "Does not expire"
                        : humanDate(credential.expires_on)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>Verification</dt>
                    <dd className="text-ink text-right">
                      {credential.verification_status.replaceAll("_", " ")}
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

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProtectedFilePreview } from "@/components/shared/protected-file-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  ApplicationDocument,
  ApplicationDocumentPortfolio,
  ApplicationDocumentType
} from "@/server/repositories/credential-portal";
import { applicationDocumentRouteFromType } from "@/server/repositories/credential-portal";
import { formatApplicationDocumentLanguage } from "./application-document-format";
import { ApplicationDocumentShare } from "./application-document-share";

type PortalContext = {
  detailBaseHref: string;
  fileBaseHref: string;
  backHref: string;
  canCreateShares: boolean;
};

type Props = {
  portfolio: ApplicationDocumentPortfolio;
  context: PortalContext;
  locale: string;
};

const DOCUMENT_TYPES: readonly ApplicationDocumentType[] = [
  "cv",
  "motivation_letter"
];

function formatDate(value: string | null, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(date);
}

function formatDateTime(value: string | null, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function DocumentCard({
  type,
  document,
  context,
  locale,
  canDownload,
  t
}: {
  type: ApplicationDocumentType;
  document: ApplicationDocument | null;
  context: PortalContext;
  locale: string;
  canDownload: boolean;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const routeType = applicationDocumentRouteFromType(type);
  const currentFile = document?.currentFile ?? null;
  const label = t(`types.${type}`);

  return (
    <article className="border-border flex min-w-0 flex-col overflow-hidden rounded-3xl border bg-white shadow-[0_1rem_2.5rem_rgba(7,31,47,0.10)]">
      <div className="bg-panel relative aspect-[4/3] overflow-hidden border-b border-[color:var(--border)]">
        {currentFile ? (
          <ProtectedFilePreview
            fileId={currentFile.id}
            fileName={currentFile.original_filename}
            mimeType={currentFile.mime_type}
            requestUrl={`${context.fileBaseHref}/${currentFile.id}?intent=view`}
            mode="thumbnail"
            className="h-full w-full"
            labels={{
              loading: t("preview.loading"),
              unavailable: t("preview.unavailable"),
              pdfFallback: t("preview.browserFallback"),
              page: t("preview.page")
            }}
          />
        ) : (
          <div className="text-muted flex h-full items-center justify-center p-8 text-center text-sm">
            {document ? t("missingFile") : t("unavailable")}
          </div>
        )}
        <Badge className="absolute top-4 left-4" variant="muted">
          PDF
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-turquoise-deep text-xs font-semibold tracking-[0.16em] uppercase">
          {label}
        </p>
        <h2 className="text-ink mt-2 font-serif text-2xl leading-tight">
          {document?.title ?? label}
        </h2>

        <dl className="text-muted mt-5 grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>{t("metadata.language")}</dt>
            <dd className="text-ink text-right">
              {formatApplicationDocumentLanguage(
                document?.language_code ?? null,
                locale
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>{t("metadata.version")}</dt>
            <dd className="text-ink text-right">
              {formatDate(document?.issued_on ?? null, locale)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>{t("metadata.updated")}</dt>
            <dd className="text-ink text-right">
              {formatDate(document?.updated_at ?? null, locale)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>{t("metadata.pages")}</dt>
            <dd className="text-ink text-right">
              {document?.page_count ?? "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-auto grid gap-2 pt-6">
          {document ? (
            <Button asChild className="min-h-11">
              <Link href={`${context.detailBaseHref}/${routeType}`}>
                {t(`actions.view.${type}`)}
              </Link>
            </Button>
          ) : (
            <Button disabled className="min-h-11">
              {t("unavailable")}
            </Button>
          )}
          {currentFile && document && canDownload ? (
            <Button asChild variant="outline" className="min-h-11">
              <a
                href={`${context.fileBaseHref}/${currentFile.id}?intent=download`}
              >
                {t("actions.download")}
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export async function ApplicationDocumentPortfolioPage({
  portfolio,
  context,
  locale
}: Props) {
  const t = await getTranslations("CredentialPortal.applicationDocuments");
  const effectiveExpiry =
    portfolio.share_expires_at ?? portfolio.access_expires_at;

  return (
    <main className="bg-panel min-h-svh px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
        <Link
          href={context.backHref}
          className="text-muted focus-visible:ring-turquoise w-fit rounded-sm text-sm underline underline-offset-4 focus-visible:ring-2 focus-visible:outline-none"
        >
          {t("backToCredentials")}
        </Link>

        <header className="bg-navy overflow-hidden rounded-3xl border border-white/10 p-6 text-white shadow-[0_1.25rem_3rem_rgba(7,31,47,0.24)] sm:p-8 lg:p-10">
          <p className="text-xs font-semibold tracking-[0.16em] text-white/75 uppercase">
            {t("kicker")}
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-3xl tracking-tight sm:text-4xl lg:text-5xl">
            {portfolio.owner.displayName}
          </h1>
          {portfolio.owner.roleTitle ? (
            <p className="text-gold mt-2 text-lg">
              {portfolio.owner.roleTitle}
            </p>
          ) : null}
          {portfolio.owner.introduction ? (
            <p className="mt-5 max-w-3xl leading-relaxed text-white/82">
              {portfolio.owner.introduction}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/78">
            <Badge variant="outline" className="border-white/25 text-white">
              {t("activeAccess")}
            </Badge>
            <span>
              {t("expires")} {formatDateTime(effectiveExpiry, locale)}
            </span>
          </div>
        </header>

        <section
          aria-labelledby="application-documents-heading"
          className="grid gap-5 lg:grid-cols-2"
        >
          <h2 id="application-documents-heading" className="sr-only">
            {t("heading")}
          </h2>
          {DOCUMENT_TYPES.map((type) => (
            <DocumentCard
              key={type}
              type={type}
              document={portfolio.documents[type]}
              context={context}
              locale={locale}
              canDownload={portfolio.permissions.canDownloadFiles}
              t={t}
            />
          ))}
        </section>

        {context.canCreateShares && portfolio.permissions.canShare ? (
          <section className="border-border grid gap-4 rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-ink text-xl font-semibold">
                {t("share.heading")}
              </h2>
              <p className="text-muted mt-1 text-sm">
                {t("share.description")}
              </p>
            </div>
            <div className="max-w-md">
              <ApplicationDocumentShare
                maximumExpiry={portfolio.access_expires_at}
                labels={{
                  action: t("share.action"),
                  expiry: t("share.expiry"),
                  copied: t("share.copied"),
                  shared: t("share.shared"),
                  error: t("share.error")
                }}
              />
            </div>
          </section>
        ) : (
          <p className="text-muted text-sm">{t("share.notPermitted")}</p>
        )}
      </div>
    </main>
  );
}

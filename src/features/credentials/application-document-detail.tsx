import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProtectedFilePreview } from "@/components/shared/protected-file-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  ApplicationDocument,
  ApplicationDocumentType
} from "@/server/repositories/credential-portal";
import { ApplicationDocumentShare } from "./application-document-share";
import { formatApplicationDocumentLanguage } from "./application-document-format";

type Props = {
  document: ApplicationDocument;
  type: ApplicationDocumentType;
  locale: string;
  overviewHref: string;
  fileBaseHref: string;
  canDownload: boolean;
  canShare: boolean;
  maximumShareExpiry?: string | null;
};

function formatDate(value: string | null, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC"
  }).format(date);
}

export async function ApplicationDocumentDetailPage({
  document,
  type,
  locale,
  overviewHref,
  fileBaseHref,
  canDownload,
  canShare,
  maximumShareExpiry = null
}: Props) {
  const t = await getTranslations("CredentialPortal.applicationDocuments");
  const file = document.currentFile;

  return (
    <main className="bg-panel min-h-svh px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Link
          href={overviewHref}
          className="text-muted focus-visible:ring-turquoise w-fit rounded-sm text-sm underline underline-offset-4 focus-visible:ring-2 focus-visible:outline-none"
        >
          {t("backToDocuments")}
        </Link>

        <header className="border-border rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <p className="text-turquoise-deep text-xs font-semibold tracking-[0.16em] uppercase">
            {t(`types.${type}`)}
          </p>
          <h1 className="text-ink mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
            {document.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline">
              {formatApplicationDocumentLanguage(
                document.language_code,
                locale
              )}
            </Badge>
            <Badge variant="muted">
              {t("metadata.version")} {formatDate(document.issued_on, locale)}
            </Badge>
            {file ? (
              <Badge variant="outline">PDF · v{file.version_number}</Badge>
            ) : null}
          </div>
        </header>

        <section className="border-border overflow-hidden rounded-3xl border bg-white shadow-sm">
          {file ? (
            <ProtectedFilePreview
              fileId={file.id}
              fileName={file.original_filename}
              mimeType={file.mime_type}
              requestUrl={`${fileBaseHref}/${file.id}?intent=view`}
              mode="document"
              className="h-[70svh] min-h-[28rem] w-full"
              labels={{
                loading: t("preview.loading"),
                unavailable: t("preview.unavailable"),
                pdfFallback: t("preview.browserFallback"),
                page: t("preview.page")
              }}
            />
          ) : (
            <div className="text-muted flex min-h-80 items-center justify-center p-8 text-center">
              {t("missingFile")}
            </div>
          )}
        </section>

        <section className="border-border grid gap-5 rounded-3xl border bg-white p-5 shadow-sm sm:p-6 md:grid-cols-2">
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-muted">{t("metadata.language")}</dt>
              <dd className="text-ink mt-1">
                {formatApplicationDocumentLanguage(
                  document.language_code,
                  locale
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t("metadata.version")}</dt>
              <dd className="text-ink mt-1">
                {formatDate(document.issued_on, locale)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t("metadata.updated")}</dt>
              <dd className="text-ink mt-1">
                {formatDate(document.updated_at, locale)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t("metadata.pages")}</dt>
              <dd className="text-ink mt-1">{document.page_count ?? "—"}</dd>
            </div>
          </dl>

          <div className="grid content-start gap-3">
            {file && canDownload ? (
              <Button asChild className="min-h-11">
                <a href={`${fileBaseHref}/${file.id}?intent=download`}>
                  {t("actions.download")}
                </a>
              </Button>
            ) : null}
            {canShare ? (
              <ApplicationDocumentShare
                maximumExpiry={maximumShareExpiry}
                labels={{
                  action: t("share.action"),
                  expiry: t("share.expiry"),
                  copied: t("share.copied"),
                  shared: t("share.shared"),
                  error: t("share.error")
                }}
              />
            ) : (
              <p className="text-muted text-sm">{t("share.notPermitted")}</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

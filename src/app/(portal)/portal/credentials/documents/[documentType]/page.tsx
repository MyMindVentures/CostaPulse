import { notFound, redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ApplicationDocumentDetailPage } from "@/features/credentials/application-document-detail";
import {
  applicationDocumentTypeFromRoute,
  CredentialPortfolioError,
  getAuthenticatedApplicationDocumentPortfolio,
  recordAuthenticatedCredentialDetailView
} from "@/server/repositories/credential-portal";

export const metadata = {
  title: "Application document",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function AuthenticatedApplicationDocumentPage({
  params
}: {
  params: Promise<{ documentType: string }>;
}) {
  const { documentType } = await params;
  const type = applicationDocumentTypeFromRoute(documentType);
  if (!type) notFound();

  const result = await (async () => {
    try {
      const [portfolio, locale] = await Promise.all([
        getAuthenticatedApplicationDocumentPortfolio(),
        getLocale()
      ]);
      const document = portfolio.documents[type];
      if (!document) notFound();
      await recordAuthenticatedCredentialDetailView(document.id);
      return { portfolio, locale, document };
    } catch (error) {
      if (error instanceof CredentialPortfolioError) {
        if (error.code === "UNAUTHORIZED") {
          redirect("/login?auth=required");
        }
        if (error.code === "NOT_GRANTED") {
          redirect("/login?auth=grant_required");
        }
      }
      throw error;
    }
  })();

  return (
    <ApplicationDocumentDetailPage
      document={result.document}
      type={type}
      locale={result.locale}
      overviewHref="/portal/credentials/documents"
      fileBaseHref="/api/credentials/files"
      canDownload={result.portfolio.permissions.canDownloadFiles}
      canShare={result.portfolio.permissions.canShare}
    />
  );
}

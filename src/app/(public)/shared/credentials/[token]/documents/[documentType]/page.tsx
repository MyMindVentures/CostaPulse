import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ApplicationDocumentDetailPage } from "@/features/credentials/application-document-detail";
import {
  applicationDocumentTypeFromRoute,
  CredentialPortfolioError,
  getSharedApplicationDocumentPortfolio,
  recordSharedCredentialDetailView
} from "@/server/repositories/credential-portal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CredentialPortal.applicationDocuments");
  return {
    title: t("metaSharedDetailTitle"),
    robots: { index: false, follow: false }
  };
}

export const dynamic = "force-dynamic";

export default async function SharedApplicationDocumentPage({
  params
}: {
  params: Promise<{ token: string; documentType: string }>;
}) {
  const { token, documentType } = await params;
  const type = applicationDocumentTypeFromRoute(documentType);
  if (!type) notFound();

  const result = await (async () => {
    try {
      const [portfolio, locale] = await Promise.all([
        getSharedApplicationDocumentPortfolio(token),
        getLocale()
      ]);
      const document = portfolio.documents[type];
      if (!document) notFound();
      await recordSharedCredentialDetailView(token, document.id);
      return { portfolio, locale, document };
    } catch (error) {
      if (error instanceof CredentialPortfolioError) {
        redirect(`/shared/credentials/${token}/documents`);
      }
      throw error;
    }
  })();

  return (
    <ApplicationDocumentDetailPage
      document={result.document}
      type={type}
      locale={result.locale}
      overviewHref={`/shared/credentials/${token}/documents`}
      fileBaseHref={`/api/shared/credentials/${token}/files`}
      canDownload={result.portfolio.permissions.canDownloadFiles}
      canShare={false}
    />
  );
}

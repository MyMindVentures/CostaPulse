import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ApplicationDocumentPortfolioPage } from "@/features/credentials/application-document-portfolio";
import {
  CredentialPortfolioError,
  getAuthenticatedApplicationDocumentPortfolio
} from "@/server/repositories/credential-portal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CredentialPortal.applicationDocuments");
  return {
    title: t("metaOverviewTitle"),
    robots: { index: false, follow: false }
  };
}

export const dynamic = "force-dynamic";

export default async function AuthenticatedApplicationDocumentsPage() {
  const result = await (async () => {
    try {
      const [portfolio, locale] = await Promise.all([
        getAuthenticatedApplicationDocumentPortfolio(),
        getLocale()
      ]);
      return { portfolio, locale };
    } catch (error) {
      if (error instanceof CredentialPortfolioError) {
        if (error.code === "UNAUTHORIZED") {
          redirect("/login?auth=required&next=/portal/credentials/documents");
        }
        if (error.code === "NOT_GRANTED") {
          redirect("/login?auth=grant_required");
        }
      }
      throw error;
    }
  })();

  return (
    <ApplicationDocumentPortfolioPage
      portfolio={result.portfolio}
      locale={result.locale}
      context={{
        detailBaseHref: "/portal/credentials/documents",
        fileBaseHref: "/api/credentials/files",
        backHref: "/portal/credentials",
        canCreateShares: true
      }}
    />
  );
}

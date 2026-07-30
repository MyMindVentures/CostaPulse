import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ApplicationDocumentPortfolioPage } from "@/features/credentials/application-document-portfolio";
import {
  CredentialPortfolioError,
  getSharedApplicationDocumentPortfolio
} from "@/server/repositories/credential-portal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CredentialPortal.applicationDocuments");
  return {
    title: t("metaSharedOverviewTitle"),
    robots: { index: false, follow: false }
  };
}

export const dynamic = "force-dynamic";

export default async function SharedApplicationDocumentsPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await (async () => {
    try {
      const [portfolio, locale] = await Promise.all([
        getSharedApplicationDocumentPortfolio(token),
        getLocale()
      ]);
      return { portfolio, locale };
    } catch (error) {
      if (error instanceof CredentialPortfolioError) return null;
      throw error;
    }
  })();

  if (!result) {
    const t = await getTranslations("CredentialPortal.applicationDocuments");
    return (
      <main className="bg-panel flex min-h-svh items-center justify-center px-4 py-10">
        <section className="border-border max-w-xl rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-ink font-serif text-3xl">
            {t("accessUnavailable.title")}
          </h1>
          <p className="text-muted mt-3 leading-relaxed">
            {t("accessUnavailable.description")}
          </p>
        </section>
      </main>
    );
  }

  return (
    <ApplicationDocumentPortfolioPage
      portfolio={result.portfolio}
      locale={result.locale}
      context={{
        detailBaseHref: `/shared/credentials/${token}/documents`,
        fileBaseHref: `/api/shared/credentials/${token}/files`,
        backHref: `/shared/credentials/${token}`,
        canCreateShares: false
      }}
    />
  );
}

"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/shared/error-state";
import { PageContainer } from "@/components/layout/PageContainer";

type TeamErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function TeamError({ error, reset }: TeamErrorProps) {
  const t = useTranslations("TeamPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <PageContainer spacing="comfortable">
        <ErrorState
          title={t("errorTitle")}
          description={t("errorDescription")}
          retryLabel={t("retry")}
          onRetry={reset}
        />
      </PageContainer>
    </main>
  );
}

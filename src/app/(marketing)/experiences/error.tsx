"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/shared/error-state";

type ExperiencesErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ExperiencesError({
  error,
  reset
}: ExperiencesErrorProps) {
  const t = useTranslations("SharedUI");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="catalog-page">
      <Container className="catalog-content py-16">
        <ErrorState
          title={t("experiencesErrorTitle")}
          description={t("experiencesErrorDescription")}
          retryLabel={t("retry")}
          onRetry={reset}
        />
      </Container>
    </main>
  );
}

"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/shared/error-state";

export default function PartnersError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("PartnerDirectory");
  useEffect(() => console.error(error), [error]);
  return (
    <main>
      <Container className="py-16">
        <ErrorState
          title={t("errorTitle")}
          description={t("errorDescription")}
          retryLabel={t("retry")}
          onRetry={reset}
        />
      </Container>
    </main>
  );
}

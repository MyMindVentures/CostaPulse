"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/shared/error-state";

type ExperienceDetailErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ExperienceDetailError({
  error,
  reset
}: ExperienceDetailErrorProps) {
  const t = useTranslations("SharedUI");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="xp-detail-page">
      <Container className="xp-detail-top py-16">
        <ErrorState
          title={t("experienceErrorTitle")}
          description={t("experienceErrorDescription")}
          retryLabel={t("retry")}
          onRetry={reset}
        />
      </Container>
    </main>
  );
}

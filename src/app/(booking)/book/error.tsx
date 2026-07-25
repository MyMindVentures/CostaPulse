"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/shared/error-state";

type BookErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function BookError({ error, reset }: BookErrorProps) {
  const t = useTranslations("SharedUI");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="bk-page">
      <Container className="py-16">
        <ErrorState
          title={t("bookingErrorTitle")}
          description={t("bookingErrorDescription")}
          retryLabel={t("retry")}
          onRetry={reset}
        />
      </Container>
    </main>
  );
}

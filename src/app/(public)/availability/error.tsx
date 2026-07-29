"use client";

import { ErrorState } from "@/components/shared/error-state";
import { Container } from "@/components/ui/container";
import { useTranslations } from "next-intl";

export default function AvailabilityError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Availability");
  return (
    <Container className="py-12">
      <ErrorState
        title={t("error")}
        description={t("errorDescription")}
        retryLabel={t("tryAgain")}
        onRetry={reset}
      />
    </Container>
  );
}

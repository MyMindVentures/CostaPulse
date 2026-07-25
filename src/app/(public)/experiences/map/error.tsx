"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/shared/error-state";

type ExperiencesMapErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ExperiencesMapError({
  error,
  reset
}: ExperiencesMapErrorProps) {
  const t = useTranslations("MapPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="map-page">
      <Container className="map-page__body py-16">
        <ErrorState
          title={t("error.title")}
          description={t("error.description")}
          retryLabel={t("error.retry")}
          onRetry={reset}
        />
        <p className="mt-6">
          <Link href="/experiences" className="button button-outline">
            {t("error.browseCatalog")}
          </Link>
        </p>
      </Container>
    </main>
  );
}

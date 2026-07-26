"use client";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/shared/error-state";

export default function InvitationError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("PartnerInvitation");
  useEffect(() => console.error(error), [error]);
  return (
    <main className="bg-panel grid min-h-[70svh] place-items-center p-6">
      <ErrorState
        title={t("errorTitle")}
        description={t("errorDescription")}
        retryLabel={t("retry")}
        onRetry={reset}
      />
    </main>
  );
}

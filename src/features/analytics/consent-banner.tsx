"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useAnalyticsConsent } from "@/features/analytics/posthog-provider";

export function ConsentBanner() {
  const t = useTranslations("AnalyticsConsent");
  const { consent, consentReady, setConsent } = useAnalyticsConsent();

  if (!consentReady || consent !== null) {
    return null;
  }

  return (
    <div
      className="consent-banner"
      role="dialog"
      aria-labelledby="consent-banner-title"
      aria-describedby="consent-banner-description"
    >
      <div className="consent-banner-copy">
        <p id="consent-banner-title" className="consent-banner-title">
          {t("title")}
        </p>
        <p
          id="consent-banner-description"
          className="consent-banner-description"
        >
          {t("description")}
        </p>
      </div>
      <div className="consent-banner-actions">
        <Button
          type="button"
          variant="outline"
          className="consent-banner-decline"
          onClick={() => setConsent("denied")}
        >
          {t("decline")}
        </Button>
        <Button
          type="button"
          variant="coral"
          onClick={() => setConsent("granted")}
        >
          {t("accept")}
        </Button>
      </div>
    </div>
  );
}

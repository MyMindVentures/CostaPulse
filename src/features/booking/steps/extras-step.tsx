"use client";

import { useTranslations } from "next-intl";

type ExtrasStepProps = {
  onBack: () => void;
  onContinue: () => void;
};

export function ExtrasStep({ onBack, onContinue }: ExtrasStepProps) {
  const t = useTranslations("Booking");

  return (
    <section className="bk-panel" aria-labelledby="booking-extras-title">
      <header className="bk-panel-header">
        <h1 id="booking-extras-title">{t("extras.title")}</h1>
        <p>{t("extras.subtitle")}</p>
      </header>

      <div className="bk-empty" role="status">
        <p>{t("extras.empty")}</p>
      </div>

      <div className="bk-actions">
        <button type="button" className="button button-light" onClick={onBack}>
          {t("actions.back")}
        </button>
        <button
          type="button"
          className="button button-gold"
          onClick={onContinue}
        >
          {t("actions.continueToReview")}
        </button>
      </div>
    </section>
  );
}

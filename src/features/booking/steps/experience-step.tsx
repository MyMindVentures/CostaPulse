"use client";

import { useTranslations } from "next-intl";
import { formatMinorUnitAmount } from "@/lib/pricing/format-money";
import type { WizardExperienceOption } from "../types";

type ExperienceStepProps = {
  experiences: WizardExperienceOption[];
  selectedSlug: string | null;
  onSelect: (experience: WizardExperienceOption) => void;
  onContinue: () => void;
};

export function ExperienceStep({
  experiences,
  selectedSlug,
  onSelect,
  onContinue
}: ExperienceStepProps) {
  const t = useTranslations("Booking");

  return (
    <section className="bk-panel" aria-labelledby="booking-experience-title">
      <header className="bk-panel-header">
        <h1 id="booking-experience-title">{t("experience.title")}</h1>
        <p>{t("experience.subtitle")}</p>
      </header>

      {experiences.length === 0 ? (
        <p className="bk-empty" role="status">
          {t("experience.empty")}
        </p>
      ) : (
        <ul className="bk-experience-list">
          {experiences.map((experience) => {
            const selected = experience.slug === selectedSlug;
            const price =
              experience.startingPriceMinor != null && experience.currency
                ? formatMinorUnitAmount(
                    experience.startingPriceMinor,
                    experience.currency
                  )
                : null;

            return (
              <li key={experience.id}>
                <button
                  type="button"
                  className={selected ? "is-selected" : undefined}
                  aria-pressed={selected}
                  onClick={() => onSelect(experience)}
                >
                  <span>
                    <strong>{experience.title}</strong>
                    {experience.shortDescription ? (
                      <em>{experience.shortDescription}</em>
                    ) : null}
                  </span>
                  {price ? <b>{price}</b> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        className="button button-gold"
        disabled={!selectedSlug}
        onClick={onContinue}
      >
        {t("actions.continueToDate")}
      </button>
    </section>
  );
}

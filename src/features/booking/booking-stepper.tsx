"use client";

import { useTranslations } from "next-intl";
import { BOOKING_STEPS, type BookingStepId } from "./types";

type BookingStepperProps = {
  current: BookingStepId;
};

export function BookingStepper({ current }: BookingStepperProps) {
  const t = useTranslations("Booking");
  const currentIndex = BOOKING_STEPS.indexOf(current);

  return (
    <ol className="bk-stepper" aria-label={t("stepperLabel")}>
      {BOOKING_STEPS.map((step, index) => {
        const state =
          index < currentIndex
            ? "is-complete"
            : index === currentIndex
              ? "is-current"
              : undefined;

        return (
          <li
            key={step}
            className={state}
            aria-current={index === currentIndex ? "step" : undefined}
          >
            <span className="bk-stepper-index">{index + 1}</span>
            <span className="bk-stepper-label">{t(`steps.${step}`)}</span>
          </li>
        );
      })}
    </ol>
  );
}

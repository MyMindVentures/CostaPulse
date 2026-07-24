"use client";

import { CalendarDays, Clock3, Languages, MapPin, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatBookingDateLong } from "@/lib/datetime/format-booking-date";
import { formatMinorUnitAmount } from "@/lib/pricing/format-money";
import type { BookingDraftState } from "./types";

type BookingSummaryProps = {
  draft: BookingDraftState;
};

export function BookingSummary({ draft }: BookingSummaryProps) {
  const t = useTranslations("Booking");
  const priceLabel =
    draft.totalAmountMinor != null && draft.currency
      ? formatMinorUnitAmount(draft.totalAmountMinor, draft.currency)
      : null;

  return (
    <aside className="bk-summary" aria-labelledby="booking-summary-title">
      {draft.experienceImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={draft.experienceImageUrl}
          alt=""
          className="bk-summary-image"
        />
      ) : (
        <div className="bk-summary-image is-empty" aria-hidden />
      )}

      <div className="bk-summary-body">
        <p className="bk-summary-kicker">{t("summary.kicker")}</p>
        <h2 id="booking-summary-title">
          {draft.experienceTitle ?? t("summary.placeholderTitle")}
        </h2>
        {draft.experienceShortDescription ? (
          <p className="bk-summary-copy">{draft.experienceShortDescription}</p>
        ) : null}

        <ul className="bk-summary-list">
          <li>
            <CalendarDays size={16} aria-hidden />
            <span>
              {formatBookingDateLong(draft.date) ?? t("summary.datePending")}
            </span>
          </li>
          <li>
            <Clock3 size={16} aria-hidden />
            <span>{draft.slotLabel ?? t("summary.timePending")}</span>
          </li>
          <li>
            <Users size={16} aria-hidden />
            <span>{t("summary.guests", { count: draft.partySize })}</span>
          </li>
          <li>
            <MapPin size={16} aria-hidden />
            <span>{draft.locationName ?? t("summary.locationPending")}</span>
          </li>
          <li>
            <Languages size={16} aria-hidden />
            <span>{draft.preferredLanguage.toUpperCase()}</span>
          </li>
        </ul>

        <div className="bk-summary-price">
          <p>{t("summary.estimatedPrice")}</p>
          <strong>{priceLabel ?? t("summary.pricePending")}</strong>
          {draft.variantName ? <em>{draft.variantName}</em> : null}
        </div>

        <p className="bk-summary-trust">{t("summary.trust")}</p>
      </div>
    </aside>
  );
}

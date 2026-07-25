"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatMinorUnitAmount } from "@/lib/pricing/format-money";
import type { BookingDraftState, EligiblePartnerReferral } from "../types";

type ReviewStepProps = {
  draft: BookingDraftState;
  expiresAt: string | null;
  onBack: () => void;
  onTermsChange: (accepted: boolean) => void;
  eligiblePartners: EligiblePartnerReferral[];
  onPartnerChange: (referralId: string) => void;
  onCreateAndPay: () => Promise<void>;
};

function formatExpiry(expiresAt: string | null) {
  if (!expiresAt) return null;
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).format(new Date(expiresAt));
}

export function ReviewStep({
  draft,
  expiresAt,
  onBack,
  onTermsChange,
  eligiblePartners,
  onPartnerChange,
  onCreateAndPay
}: ReviewStepProps) {
  const t = useTranslations("Booking");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const priceLabel =
    draft.totalAmountMinor != null && draft.currency
      ? formatMinorUnitAmount(draft.totalAmountMinor, draft.currency)
      : null;
  const selectedPartner = eligiblePartners.find(
    (partner) => partner.referralId === draft.selectedReferralId
  );
  const projectedVoucher =
    selectedPartner && draft.totalAmountMinor != null && draft.currency
      ? formatMinorUnitAmount(
          Math.round(
            (draft.totalAmountMinor * selectedPartner.rewardBasisPoints) / 10000
          ),
          draft.currency
        )
      : null;

  return (
    <section className="bk-panel" aria-labelledby="booking-review-title">
      <header className="bk-panel-header">
        <h1 id="booking-review-title">{t("review.title")}</h1>
        <p>{t("review.subtitle")}</p>
      </header>

      <dl className="bk-review-list">
        <div>
          <dt>{t("review.experience")}</dt>
          <dd>{draft.experienceTitle}</dd>
        </div>
        <div>
          <dt>{t("review.variant")}</dt>
          <dd>{draft.variantName}</dd>
        </div>
        <div>
          <dt>{t("review.when")}</dt>
          <dd>
            {draft.date} · {draft.slotLabel}
          </dd>
        </div>
        <div>
          <dt>{t("review.guests")}</dt>
          <dd>{t("summary.guests", { count: draft.partySize })}</dd>
        </div>
        <div>
          <dt>{t("review.contact")}</dt>
          <dd>
            {draft.contactFirstName} {draft.contactLastName}
            <br />
            {draft.customerEmail}
          </dd>
        </div>
        <div>
          <dt>{t("review.total")}</dt>
          <dd>{priceLabel ?? t("summary.pricePending")}</dd>
        </div>
      </dl>

      {eligiblePartners.length > 0 ? (
        <fieldset className="border-border mt-6 rounded-xl border p-4">
          <legend className="px-2 font-semibold">
            {t("review.partnerReward")}
          </legend>
          <div className="grid gap-3">
            {eligiblePartners.map((partner) => (
              <label
                key={partner.referralId}
                className="border-border flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3"
              >
                <input
                  type="radio"
                  name="selectedPartner"
                  value={partner.referralId}
                  checked={draft.selectedReferralId === partner.referralId}
                  onChange={() => onPartnerChange(partner.referralId)}
                  className="accent-turquoise mt-1 size-5"
                />
                <span>
                  <strong className="block">{partner.partnerName}</strong>
                  <span className="text-muted text-sm">
                    {t("review.partnerRewardPercent", {
                      percent: partner.rewardBasisPoints / 100
                    })}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {projectedVoucher ? (
            <p className="text-turquoise mt-4 text-sm font-semibold">
              {t("review.projectedVoucher", { amount: projectedVoucher })}
            </p>
          ) : null}
        </fieldset>
      ) : null}

      {expiresAt ? (
        <p className="bk-hold-note">
          {t("review.holdUntil", { time: formatExpiry(expiresAt) ?? "" })}
        </p>
      ) : null}

      <label className="bk-terms">
        <input
          type="checkbox"
          checked={draft.termsAccepted}
          onChange={(event) => onTermsChange(event.target.checked)}
        />
        <span>{t("review.terms")}</span>
      </label>

      {error ? (
        <p className="bk-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="bk-actions">
        <button type="button" className="button button-light" onClick={onBack}>
          {t("actions.back")}
        </button>
        <button
          type="button"
          className="button button-gold"
          disabled={
            !draft.termsAccepted ||
            isPending ||
            (eligiblePartners.length > 0 && !draft.selectedReferralId)
          }
          onClick={() => {
            setError(null);
            startTransition(async () => {
              try {
                await onCreateAndPay();
              } catch (cause) {
                setError(
                  cause instanceof Error ? cause.message : t("review.payError")
                );
              }
            });
          }}
        >
          {isPending ? t("review.paying") : t("actions.payNow")}
        </button>
      </div>
    </section>
  );
}

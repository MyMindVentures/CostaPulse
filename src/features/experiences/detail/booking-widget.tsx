"use client";

import Link from "next/link";
import { BadgeCheck, CalendarDays, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatBookingDateShort } from "@/lib/datetime/format-booking-date";
import { formatMinorUnitAmount } from "@/lib/pricing/format-money";
import type { ExperienceDetailVariant } from "@/server/repositories/catalog";
import { RatingStars } from "./rating-stars";

type BookingWidgetProps = {
  experienceSlug: string;
  experienceId: string;
  timezone: string;
  variants: ExperienceDetailVariant[];
  pricingModel: "per_person" | "per_group" | null;
  startingPriceMinor: number | null;
  currency: string | null;
  averageRating: number | null;
  reviewCount: number;
  policies: Array<{
    policyType: string;
    title: string;
    description: string | null;
    valueMinutes: number | null;
  }>;
  referralCode?: string | null;
};

type AvailabilitySlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  localStartLabel: string;
  capacityRemaining: number;
  capacityTotal: number;
  isInstantConfirmation: boolean;
};

function defaultPartySize(variant: ExperienceDetailVariant | undefined) {
  if (!variant) return 1;
  const preferred = 2;
  if (preferred < variant.minPartySize) return variant.minPartySize;
  if (variant.maxPartySize !== null && preferred > variant.maxPartySize) {
    return variant.maxPartySize;
  }
  return preferred;
}

function defaultDateInTimezone(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "01";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function BookingWidget({
  experienceSlug,
  experienceId,
  timezone,
  variants,
  pricingModel,
  startingPriceMinor,
  currency,
  averageRating,
  reviewCount,
  policies,
  referralCode
}: BookingWidgetProps) {
  const t = useTranslations("Booking");
  const initialVariant =
    variants.find((variant) => variant.isDefault) ?? variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(
    initialVariant?.id ?? ""
  );
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ??
    initialVariant;

  const [date, setDate] = useState(() => defaultDateInTimezone(timezone));
  const [partySize, setPartySize] = useState(() =>
    defaultPartySize(initialVariant)
  );
  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [isPending, startTransition] = useTransition();

  const maxGuests = selectedVariant?.maxPartySize ?? null;
  const priceLabel =
    selectedVariant && currency
      ? formatMinorUnitAmount(
          selectedVariant.unitAmountMinor,
          selectedVariant.currency
        )
      : startingPriceMinor !== null && currency
        ? formatMinorUnitAmount(startingPriceMinor, currency)
        : null;

  const priceSuffix =
    (selectedVariant?.pricingModel ?? pricingModel) === "per_person"
      ? t("widget.perPerson")
      : (selectedVariant?.pricingModel ?? pricingModel) === "per_group"
        ? t("widget.perGroup")
        : null;

  const cancellationPolicy = policies.find(
    (policy) => policy.policyType === "cancellation"
  );
  const confirmationPolicy = policies.find(
    (policy) => policy.policyType === "confirmation"
  );

  const guestOptions = useMemo(() => {
    if (!selectedVariant) return [1];
    const max = selectedVariant.maxPartySize ?? selectedVariant.minPartySize;
    const options: number[] = [];
    for (let size = selectedVariant.minPartySize; size <= max; size += 1) {
      options.push(size);
    }
    return options;
  }, [selectedVariant]);

  const continueHref = useMemo(() => {
    if (!selectedVariant || !selectedSlotId) return null;
    const params = new URLSearchParams({
      variantId: selectedVariant.id,
      date,
      partySize: String(partySize),
      slotId: selectedSlotId
    });
    if (referralCode) params.set("ref", referralCode);
    return `/book/${encodeURIComponent(experienceSlug)}?${params.toString()}`;
  }, [
    date,
    experienceSlug,
    partySize,
    referralCode,
    selectedSlotId,
    selectedVariant
  ]);

  function onVariantChange(variantId: string) {
    const next = variants.find((variant) => variant.id === variantId);
    setSelectedVariantId(variantId);
    setPartySize(defaultPartySize(next));
    setSlots(null);
    setSelectedSlotId(null);
    setChecked(false);
    setError(null);
  }

  function checkAvailability() {
    if (!selectedVariant) {
      setError(t("widget.chooseVariant"));
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const params = new URLSearchParams({
          variantId: selectedVariant.id,
          date,
          partySize: String(partySize)
        });
        const response = await fetch(
          `/api/experiences/${encodeURIComponent(experienceSlug)}/availability?${params.toString()}`
        );
        const payload = (await response.json()) as {
          status?: string;
          error?: string;
          slots?: AvailabilitySlot[];
        };

        if (!response.ok) {
          setSlots(null);
          setSelectedSlotId(null);
          setChecked(true);
          setError(payload.error ?? t("widget.availabilityError"));
          return;
        }

        setSlots(payload.slots ?? []);
        setSelectedSlotId(null);
        setChecked(true);
      } catch {
        setSlots(null);
        setSelectedSlotId(null);
        setChecked(true);
        setError(t("widget.availabilityError"));
      }
    });
  }

  return (
    <section
      className="xp-booking-widget"
      id="booking"
      aria-labelledby="booking-title"
    >
      <div className="xp-booking-price">
        <p>
          {priceLabel ? (
            <>
              {t("widget.from")} <strong>{priceLabel}</strong>
              {priceSuffix ? ` ${priceSuffix}` : null}
            </>
          ) : null}
        </p>
        <RatingStars rating={averageRating ?? 0} reviewCount={reviewCount} />
      </div>

      {variants.length > 0 ? (
        <fieldset className="xp-variant-toggle grid grid-cols-2 gap-2 sm:grid-cols-3">
          <legend className="visually-hidden">{t("widget.duration")}</legend>
          {variants.map((variant) => {
            const label = `${variant.name} ${formatMinorUnitAmount(variant.unitAmountMinor, variant.currency)}`;

            return (
              <button
                key={variant.id}
                type="button"
                className={
                  variant.id === selectedVariant?.id ? "is-active" : undefined
                }
                aria-pressed={variant.id === selectedVariant?.id}
                onClick={() => onVariantChange(variant.id)}
              >
                {label}
              </button>
            );
          })}
        </fieldset>
      ) : null}

      <label className="xp-field">
        <span>
          <CalendarDays size={16} aria-hidden />
          {t("widget.date")}
        </span>
        <input
          type="date"
          value={date}
          disabled={!date}
          onChange={(event) => {
            setDate(event.target.value);
            setSlots(null);
            setChecked(false);
            setError(null);
          }}
        />
        <em suppressHydrationWarning>
          {date ? formatBookingDateShort(date, timezone) : t("widget.date")}
        </em>
      </label>

      <label className="xp-field">
        <span>
          <Users size={16} aria-hidden />
          {t("widget.guests")}
        </span>
        <select
          value={partySize}
          onChange={(event) => {
            setPartySize(Number(event.target.value));
            setSlots(null);
            setChecked(false);
            setError(null);
          }}
        >
          {guestOptions.map((size) => (
            <option key={size} value={size}>
              {t("summary.guests", { count: size })}
            </option>
          ))}
        </select>
        {maxGuests ? (
          <em>{t("widget.maxGuests", { count: maxGuests })}</em>
        ) : null}
      </label>

      <button
        type="button"
        className="button button-gold"
        onClick={checkAvailability}
        disabled={isPending || !selectedVariant}
      >
        {isPending ? t("widget.checking") : t("widget.checkAvailability")}
      </button>

      <div className="xp-booking-trust">
        {cancellationPolicy ? (
          <p>
            <ShieldCheck size={16} aria-hidden />
            {cancellationPolicy.description ?? cancellationPolicy.title}
          </p>
        ) : null}
        {confirmationPolicy ? (
          <p>
            <BadgeCheck size={16} aria-hidden />
            {confirmationPolicy.description ?? confirmationPolicy.title}
          </p>
        ) : null}
      </div>

      <div className="xp-availability-result" aria-live="polite">
        {error ? (
          <p className="xp-availability-error" role="alert">
            {error}
          </p>
        ) : null}

        {checked && !error && slots && slots.length === 0 ? (
          <p className="xp-availability-empty">{t("widget.noSlots")}</p>
        ) : null}

        {slots && slots.length > 0 ? (
          <fieldset className="xp-slot-list">
            <legend>{t("widget.availableTimes")}</legend>
            {slots.map((slot) => (
              <label
                key={slot.id}
                className={selectedSlotId === slot.id ? "is-active" : undefined}
              >
                <input
                  type="radio"
                  name={`slot-${experienceId}`}
                  value={slot.id}
                  checked={selectedSlotId === slot.id}
                  onChange={() => setSelectedSlotId(slot.id)}
                />
                <span>{slot.localStartLabel}</span>
                <em>
                  {t("datetime.spotsLeft", { count: slot.capacityRemaining })}
                  {slot.isInstantConfirmation
                    ? ` · ${t("widget.instant")}`
                    : ""}
                </em>
              </label>
            ))}
            {continueHref ? (
              <Link className="button button-gold" href={continueHref}>
                {t("widget.continue")}
              </Link>
            ) : (
              <p className="xp-availability-next">{t("widget.selectSlot")}</p>
            )}
          </fieldset>
        ) : null}
      </div>
    </section>
  );
}

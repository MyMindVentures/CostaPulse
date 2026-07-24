"use client";

import { BadgeCheck, CalendarDays, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
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
};

type AvailabilitySlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  localStartLabel: string;
  capacityRemaining: number;
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

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "01";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function formatDateLabel(date: string, timeZone: string) {
  const noonUtc = new Date(`${date}T12:00:00.000Z`);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(noonUtc);
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
  policies
}: BookingWidgetProps) {
  const initialVariant = variants.find((variant) => variant.isDefault) ?? variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant?.id ?? "");
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ?? initialVariant;

  const [date, setDate] = useState(() => defaultDateInTimezone(timezone));
  const [partySize, setPartySize] = useState(() => defaultPartySize(initialVariant));
  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [isPending, startTransition] = useTransition();

  const maxGuests = selectedVariant?.maxPartySize ?? null;
  const priceLabel =
    selectedVariant && currency
      ? formatMinorUnitAmount(selectedVariant.unitAmountMinor, selectedVariant.currency)
      : startingPriceMinor !== null && currency
        ? formatMinorUnitAmount(startingPriceMinor, currency)
        : null;

  const priceSuffix =
    (selectedVariant?.pricingModel ?? pricingModel) === "per_person"
      ? "per person"
      : (selectedVariant?.pricingModel ?? pricingModel) === "per_group"
        ? "per group"
        : null;

  const cancellationPolicy = policies.find((policy) => policy.policyType === "cancellation");
  const confirmationPolicy = policies.find((policy) => policy.policyType === "confirmation");

  const guestOptions = useMemo(() => {
    if (!selectedVariant) return [1];
    const max = selectedVariant.maxPartySize ?? selectedVariant.minPartySize;
    const options: number[] = [];
    for (let size = selectedVariant.minPartySize; size <= max; size += 1) {
      options.push(size);
    }
    return options;
  }, [selectedVariant]);

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
      setError("Choose a duration option to continue.");
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
          setError(payload.error ?? "Availability could not be checked.");
          return;
        }

        setSlots(payload.slots ?? []);
        setSelectedSlotId(null);
        setChecked(true);
      } catch {
        setSlots(null);
        setSelectedSlotId(null);
        setChecked(true);
        setError("Availability could not be checked. Please try again.");
      }
    });
  }

  return (
    <section className="xp-booking-widget" id="booking" aria-labelledby="booking-title">
      <div className="xp-booking-price">
        <p>
          {priceLabel ? (
            <>
              From <strong>{priceLabel}</strong>
              {priceSuffix ? ` ${priceSuffix}` : null}
            </>
          ) : null}
        </p>
        <RatingStars rating={averageRating ?? 0} reviewCount={reviewCount} />
      </div>

      {variants.length > 0 ? (
        <fieldset className="xp-variant-toggle">
          <legend className="visually-hidden">Duration</legend>
          {variants.map((variant) => {
            const label = `${variant.name} ${formatMinorUnitAmount(variant.unitAmountMinor, variant.currency)}`;

            return (
              <button
                key={variant.id}
                type="button"
                className={variant.id === selectedVariant?.id ? "is-active" : undefined}
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
          Date
        </span>
        <input
          type="date"
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setSlots(null);
            setChecked(false);
            setError(null);
          }}
        />
        <em>{formatDateLabel(date, timezone)}</em>
      </label>

      <label className="xp-field">
        <span>
          <Users size={16} aria-hidden />
          Guests
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
              {size} {size === 1 ? "Adult" : "Adults"}
            </option>
          ))}
        </select>
        {maxGuests ? (
          <em>Maximum {maxGuests} guests per booking</em>
        ) : null}
      </label>

      <button
        type="button"
        className="button button-gold"
        onClick={checkAvailability}
        disabled={isPending || !selectedVariant}
      >
        {isPending ? "Checking…" : "Check Availability"}
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
        {error ? <p className="xp-availability-error" role="alert">{error}</p> : null}

        {checked && !error && slots && slots.length === 0 ? (
          <p className="xp-availability-empty">
            No available departures on this date for your group size.
          </p>
        ) : null}

        {slots && slots.length > 0 ? (
          <fieldset className="xp-slot-list">
            <legend>Available times</legend>
            {slots.map((slot) => (
              <label key={slot.id} className={selectedSlotId === slot.id ? "is-active" : undefined}>
                <input
                  type="radio"
                  name={`slot-${experienceId}`}
                  value={slot.id}
                  checked={selectedSlotId === slot.id}
                  onChange={() => setSelectedSlotId(slot.id)}
                />
                <span>{slot.localStartLabel}</span>
                <em>
                  {slot.capacityRemaining} spots
                  {slot.isInstantConfirmation ? " · Instant confirmation" : ""}
                </em>
              </label>
            ))}
            <p className="xp-availability-next">
              Times confirmed. Checkout will be available in a later step.
            </p>
          </fieldset>
        ) : null}
      </div>
    </section>
  );
}

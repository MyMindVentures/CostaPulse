"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { leadingEmptyCellCountForMonth } from "@/lib/datetime/calendar-grid";
import { formatMonthYearUtc } from "@/lib/datetime/format-booking-date";
import { formatMinorUnitAmount } from "@/lib/pricing/format-money";
import type {
  AvailabilitySlotDto,
  CalendarDayDto,
  WizardVariantOption
} from "../types";

type DateTimeStepProps = {
  experienceSlug: string;
  timezone: string;
  variants: WizardVariantOption[];
  variantId: string | null;
  date: string | null;
  partySize: number;
  slotId: string | null;
  onVariantChange: (variant: WizardVariantOption) => void;
  onDateChange: (date: string) => void;
  onPartySizeChange: (partySize: number) => void;
  onSlotSelect: (slot: AvailabilitySlotDto | null) => void;
  onContinue: () => void;
  onBack: () => void;
};

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function monthBounds(anchor: Date) {
  const year = anchor.getUTCFullYear();
  const month = anchor.getUTCMonth();
  const from = new Date(Date.UTC(year, month, 1));
  const to = new Date(Date.UTC(year, month + 1, 0));
  const pad = (value: number) => String(value).padStart(2, "0");
  return {
    year,
    month,
    from: `${from.getUTCFullYear()}-${pad(from.getUTCMonth() + 1)}-${pad(from.getUTCDate())}`,
    to: `${to.getUTCFullYear()}-${pad(to.getUTCMonth() + 1)}-${pad(to.getUTCDate())}`,
    label: formatMonthYearUtc(year, month),
    leadingEmpty: leadingEmptyCellCountForMonth(year, month)
  };
}

function resolveSlotSelection(
  slots: AvailabilitySlotDto[],
  slotId: string | null
): AvailabilitySlotDto | null {
  if (slots.length === 0) return null;
  const matched = slotId ? slots.find((slot) => slot.id === slotId) : undefined;
  if (matched) return matched;
  if (slots.length === 1) return slots[0];
  return null;
}

export function DateTimeStep({
  experienceSlug,
  timezone,
  variants,
  variantId,
  date,
  partySize,
  slotId,
  onVariantChange,
  onDateChange,
  onPartySizeChange,
  onSlotSelect,
  onContinue,
  onBack
}: DateTimeStepProps) {
  const t = useTranslations("Booking");
  const selectedVariant =
    variants.find((variant) => variant.id === variantId) ?? variants[0];
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const base = date ? new Date(`${date}T12:00:00.000Z`) : new Date();
    return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
  });
  const [days, setDays] = useState<CalendarDayDto[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlotDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const onSlotSelectRef = useRef(onSlotSelect);
  const slotIdRef = useRef(slotId);
  const loadErrorMessage = t("datetime.loadError");

  useEffect(() => {
    onSlotSelectRef.current = onSlotSelect;
  }, [onSlotSelect]);

  useEffect(() => {
    slotIdRef.current = slotId;
  }, [slotId]);

  const guestOptions = useMemo(() => {
    if (!selectedVariant) return [1];
    const max = selectedVariant.maxPartySize ?? selectedVariant.minPartySize;
    const options: number[] = [];
    for (let size = selectedVariant.minPartySize; size <= max; size += 1) {
      options.push(size);
    }
    return options;
  }, [selectedVariant]);

  const bounds = monthBounds(monthAnchor);
  const selectedVariantId = selectedVariant?.id ?? null;

  useEffect(() => {
    if (!selectedVariantId) return;

    const controller = new AbortController();

    void (async () => {
      await Promise.resolve();
      if (controller.signal.aborted) return;

      setCalendarLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          variantId: selectedVariantId,
          from: bounds.from,
          to: bounds.to,
          partySize: String(partySize)
        });
        const response = await fetch(
          `/api/experiences/${encodeURIComponent(experienceSlug)}/availability?${params}`,
          { signal: controller.signal }
        );
        const payload = (await response.json()) as {
          error?: string;
          days?: CalendarDayDto[];
        };
        if (controller.signal.aborted) return;

        if (!response.ok) {
          setDays([]);
          setError(payload.error ?? loadErrorMessage);
          return;
        }
        setDays(payload.days ?? []);
      } catch {
        if (controller.signal.aborted) return;
        setDays([]);
        setError(loadErrorMessage);
      } finally {
        if (!controller.signal.aborted) {
          setCalendarLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [
    bounds.from,
    bounds.to,
    experienceSlug,
    loadErrorMessage,
    partySize,
    selectedVariantId
  ]);

  useEffect(() => {
    if (!selectedVariantId || !date) {
      return;
    }

    const controller = new AbortController();

    void (async () => {
      await Promise.resolve();
      if (controller.signal.aborted) return;

      setSlotsLoading(true);
      setError(null);
      setSlots([]);

      try {
        const params = new URLSearchParams({
          variantId: selectedVariantId,
          date,
          partySize: String(partySize)
        });
        const response = await fetch(
          `/api/experiences/${encodeURIComponent(experienceSlug)}/availability?${params}`,
          { signal: controller.signal }
        );
        const payload = (await response.json()) as {
          error?: string;
          slots?: AvailabilitySlotDto[];
        };
        if (controller.signal.aborted) return;

        if (!response.ok) {
          setSlots([]);
          onSlotSelectRef.current(null);
          setError(payload.error ?? loadErrorMessage);
          return;
        }

        const nextSlots = payload.slots ?? [];
        setSlots(nextSlots);

        const resolved = resolveSlotSelection(nextSlots, slotIdRef.current);
        if (resolved) {
          onSlotSelectRef.current(resolved);
        } else if (slotIdRef.current) {
          onSlotSelectRef.current(null);
        }
      } catch {
        if (controller.signal.aborted) return;
        setSlots([]);
        onSlotSelectRef.current(null);
        setError(loadErrorMessage);
      } finally {
        if (!controller.signal.aborted) {
          setSlotsLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [date, experienceSlug, loadErrorMessage, partySize, selectedVariantId]);

  useEffect(() => {
    if (!date || days.length === 0) return;
    const node = document.querySelector<HTMLElement>(
      `[data-calendar-date="${date}"]`
    );
    node?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [date, days]);

  const visibleSlots = selectedVariant && date ? slots : [];
  const isLoading = calendarLoading || slotsLoading;

  return (
    <section className="bk-panel" aria-labelledby="booking-datetime-title">
      <header className="bk-panel-header">
        <h1 id="booking-datetime-title">{t("datetime.title")}</h1>
        <p>{t("datetime.subtitle")}</p>
      </header>

      {variants.length > 1 ? (
        <fieldset className="bk-variant-toggle">
          <legend>{t("datetime.variantLabel")}</legend>
          {variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              className={
                variant.id === selectedVariant?.id ? "is-active" : undefined
              }
              aria-pressed={variant.id === selectedVariant?.id}
              onClick={() => onVariantChange(variant)}
            >
              {variant.name}{" "}
              {formatMinorUnitAmount(variant.unitAmountMinor, variant.currency)}
            </button>
          ))}
        </fieldset>
      ) : null}

      <label className="bk-field">
        <span>{t("datetime.guestsLabel")}</span>
        <select
          value={partySize}
          onChange={(event) => onPartySizeChange(Number(event.target.value))}
        >
          {guestOptions.map((size) => (
            <option key={size} value={size}>
              {t("summary.guests", { count: size })}
            </option>
          ))}
        </select>
      </label>

      <div className="bk-calendar">
        <div className="bk-calendar-nav">
          <button
            type="button"
            className="button button-light"
            onClick={() =>
              setMonthAnchor(
                new Date(
                  Date.UTC(
                    monthAnchor.getUTCFullYear(),
                    monthAnchor.getUTCMonth() - 1,
                    1
                  )
                )
              )
            }
          >
            {t("datetime.prevMonth")}
          </button>
          <strong>{bounds.label}</strong>
          <button
            type="button"
            className="button button-light"
            onClick={() =>
              setMonthAnchor(
                new Date(
                  Date.UTC(
                    monthAnchor.getUTCFullYear(),
                    monthAnchor.getUTCMonth() + 1,
                    1
                  )
                )
              )
            }
          >
            {t("datetime.nextMonth")}
          </button>
        </div>

        <div
          className="bk-calendar-grid"
          role="grid"
          aria-label={t("datetime.calendarLabel")}
        >
          {WEEKDAY_KEYS.map((key) => (
            <div key={key} className="bk-calendar-weekday" aria-hidden>
              {t(`datetime.weekdays.${key}`)}
            </div>
          ))}
          {Array.from({ length: bounds.leadingEmpty }, (_, index) => (
            <div key={`pad-${index}`} className="bk-calendar-pad" aria-hidden />
          ))}
          {days.map((day) => (
            <button
              key={day.date}
              type="button"
              data-calendar-date={day.date}
              aria-label={t("datetime.dayLabel", { date: day.date })}
              aria-pressed={date === day.date}
              className={[
                "bk-calendar-day",
                `is-${day.level}`,
                date === day.date ? "is-selected" : undefined
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={day.level === "none" || day.level === "full"}
              onClick={() => onDateChange(day.date)}
            >
              <span>{Number(day.date.slice(-2))}</span>
              <em>
                {day.level === "none"
                  ? ""
                  : t(`datetime.levels.${day.level}`, {
                      count: day.capacityAvailable
                    })}
              </em>
            </button>
          ))}
        </div>

        <ul className="bk-calendar-legend">
          <li className="is-good">{t("datetime.legend.good")}</li>
          <li className="is-limited">{t("datetime.legend.limited")}</li>
          <li className="is-full">{t("datetime.legend.full")}</li>
        </ul>
      </div>

      <div className="bk-slot-panel" aria-live="polite">
        <h2>{t("datetime.slotsTitle")}</h2>
        <p>{t("datetime.localTime", { timezone })}</p>
        {error ? (
          <p className="bk-error" role="alert">
            {error}
          </p>
        ) : null}
        {isLoading ? <p>{t("datetime.loading")}</p> : null}
        {!isLoading && date && visibleSlots.length === 0 ? (
          <p className="bk-empty">{t("datetime.noSlots")}</p>
        ) : null}
        {visibleSlots.length > 0 ? (
          <ul className="bk-slot-list">
            {visibleSlots.map((slot) => (
              <li key={slot.id}>
                <button
                  type="button"
                  className={slotId === slot.id ? "is-selected" : undefined}
                  aria-pressed={slotId === slot.id}
                  onClick={() => onSlotSelect(slot)}
                >
                  <strong>{slot.localStartLabel}</strong>
                  <span>
                    {t("datetime.spotsLeft", { count: slot.capacityRemaining })}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="bk-actions">
        <button type="button" className="button button-light" onClick={onBack}>
          {t("actions.back")}
        </button>
        <button
          type="button"
          className="button button-gold"
          disabled={!slotId}
          onClick={onContinue}
        >
          {t("actions.continueToDetails")}
        </button>
      </div>
    </section>
  );
}

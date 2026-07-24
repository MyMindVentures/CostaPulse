export function formatMinorUnitAmount(
  amountMinor: number,
  currency: string,
  locale = "en-GB"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: amountMinor % 100 === 0 ? 0 : 2
  }).format(amountMinor / 100);
}

export function formatDurationHours(durationMinutes: number): {
  hours: number;
  labelKey: "hours" | "hour";
} {
  const hours = durationMinutes / 60;
  const rounded =
    Number.isInteger(hours) || hours % 0.5 === 0
      ? hours
      : Math.round(hours * 10) / 10;

  return {
    hours: rounded,
    labelKey: rounded === 1 ? "hour" : "hours"
  };
}

import { formatMinorUnitAmount } from "@/lib/pricing/format-money";
import { cn } from "@/lib/utils";

type PriceDisplayProps = {
  amountMinor: number | null | undefined;
  currency: string | null | undefined;
  locale?: string;
  className?: string;
  fallback?: string | null;
};

/**
 * Formats a minor-unit price for display. Returns null (or fallback) when data is missing.
 */
export function PriceDisplay({
  amountMinor,
  currency,
  locale = "en-GB",
  className,
  fallback = null
}: PriceDisplayProps) {
  if (amountMinor == null || !currency) {
    return fallback ? <span className={className}>{fallback}</span> : null;
  }

  return (
    <span className={cn(className)} data-slot="price-display">
      {formatMinorUnitAmount(amountMinor, currency, locale)}
    </span>
  );
}

export function formatPriceLabel(
  amountMinor: number | null | undefined,
  currency: string | null | undefined,
  locale = "en-GB"
): string | null {
  if (amountMinor == null || !currency) return null;
  return formatMinorUnitAmount(amountMinor, currency, locale);
}

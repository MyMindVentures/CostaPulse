import type { Enums } from "@/types/database";

type DraftBookingAmountInput = {
  pricingModel: Enums<"variant_pricing_model">;
  unitAmountMinor: number;
  partySize: number;
  voucherAmountMinor?: number;
};

export function calculateDraftBookingAmounts({
  pricingModel,
  unitAmountMinor,
  partySize,
  voucherAmountMinor = 0
}: DraftBookingAmountInput) {
  const subtotalAmountMinor =
    pricingModel === "per_group"
      ? unitAmountMinor
      : unitAmountMinor * partySize;
  const safeVoucherAmountMinor = Math.min(
    voucherAmountMinor,
    subtotalAmountMinor
  );

  return {
    unitAmountMinor,
    subtotalAmountMinor,
    voucherAmountMinor: safeVoucherAmountMinor,
    totalAmountMinor: subtotalAmountMinor - safeVoucherAmountMinor
  };
}

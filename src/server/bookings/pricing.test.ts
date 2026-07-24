import { describe, expect, it } from "vitest";
import { calculateDraftBookingAmounts } from "./pricing";

describe("calculateDraftBookingAmounts", () => {
  it("multiplies party size for per-person variants", () => {
    const amounts = calculateDraftBookingAmounts({
      pricingModel: "per_person",
      unitAmountMinor: 12500,
      partySize: 3,
      voucherAmountMinor: 2500
    });

    expect(amounts).toEqual({
      unitAmountMinor: 12500,
      subtotalAmountMinor: 37500,
      voucherAmountMinor: 2500,
      totalAmountMinor: 35000
    });
  });

  it("keeps the subtotal flat for per-group variants", () => {
    const amounts = calculateDraftBookingAmounts({
      pricingModel: "per_group",
      unitAmountMinor: 42000,
      partySize: 6,
      voucherAmountMinor: 0
    });

    expect(amounts).toEqual({
      unitAmountMinor: 42000,
      subtotalAmountMinor: 42000,
      voucherAmountMinor: 0,
      totalAmountMinor: 42000
    });
  });

  it("clamps oversized vouchers so totals never go negative", () => {
    const amounts = calculateDraftBookingAmounts({
      pricingModel: "per_person",
      unitAmountMinor: 4000,
      partySize: 2,
      voucherAmountMinor: 12000
    });

    expect(amounts).toEqual({
      unitAmountMinor: 4000,
      subtotalAmountMinor: 8000,
      voucherAmountMinor: 8000,
      totalAmountMinor: 0
    });
  });
});

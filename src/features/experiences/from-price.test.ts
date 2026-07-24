import { describe, expect, it } from "vitest";
import {
  resolveExperienceCardTone,
  selectFromPrice,
  takeHighlightFeatures
} from "./from-price";

describe("selectFromPrice", () => {
  it("prefers the default active variant over a cheaper non-default", () => {
    expect(
      selectFromPrice([
        {
          unitAmountMinor: 3000,
          currency: "EUR",
          pricingModel: "per_person",
          isDefault: false,
          isActive: true
        },
        {
          unitAmountMinor: 6500,
          currency: "EUR",
          pricingModel: "per_person",
          isDefault: true,
          isActive: true
        }
      ])
    ).toEqual({
      amountMinor: 6500,
      currency: "EUR",
      pricingModel: "per_person"
    });
  });

  it("falls back to the cheapest active variant when none is default", () => {
    expect(
      selectFromPrice([
        {
          unitAmountMinor: 18000,
          currency: "EUR",
          pricingModel: "per_group",
          isDefault: false,
          isActive: true
        },
        {
          unitAmountMinor: 12000,
          currency: "EUR",
          pricingModel: "per_group",
          isDefault: false,
          isActive: true
        }
      ])
    ).toEqual({
      amountMinor: 12000,
      currency: "EUR",
      pricingModel: "per_group"
    });
  });

  it("ignores inactive variants", () => {
    expect(
      selectFromPrice([
        {
          unitAmountMinor: 1000,
          currency: "EUR",
          pricingModel: "per_person",
          isDefault: true,
          isActive: false
        },
        {
          unitAmountMinor: 6500,
          currency: "EUR",
          pricingModel: "per_person",
          isDefault: false,
          isActive: true
        }
      ])
    ).toEqual({
      amountMinor: 6500,
      currency: "EUR",
      pricingModel: "per_person"
    });
  });

  it("returns null when no active variants exist", () => {
    expect(
      selectFromPrice([
        {
          unitAmountMinor: 6500,
          currency: "EUR",
          pricingModel: "per_person",
          isDefault: true,
          isActive: false
        }
      ])
    ).toBeNull();
  });
});

describe("takeHighlightFeatures", () => {
  it("returns up to two trimmed string highlights", () => {
    expect(
      takeHighlightFeatures([
        "  Skipper included ",
        "Fuel options",
        "Sunset views"
      ])
    ).toEqual(["Skipper included", "Fuel options"]);
  });

  it("ignores non-string values", () => {
    expect(takeHighlightFeatures(["Local guide", 42, null, "Photos"])).toEqual(
      ["Local guide", "Photos"]
    );
  });
});

describe("resolveExperienceCardTone", () => {
  it("maps known experience types to mockup tones", () => {
    expect(resolveExperienceCardTone("boat_experience")).toBe(1);
    expect(resolveExperienceCardTone("paddlesurf_mentor")).toBe(2);
    expect(resolveExperienceCardTone("bbq_experience")).toBe(3);
  });

  it("falls back to a rotating tone for unknown types", () => {
    expect(resolveExperienceCardTone(null, 0)).toBe(1);
    expect(resolveExperienceCardTone("unknown", 1)).toBe(2);
  });
});

import { describe, expect, it } from "vitest";
import { formatMinorUnitAmount } from "@/lib/pricing/format-money";

describe("experience detail booking labels", () => {
  it("formats per-boat variant prices without cents when whole euros", () => {
    expect(formatMinorUnitAmount(35000, "EUR")).toBe("€350");
    expect(formatMinorUnitAmount(59000, "EUR")).toBe("€590");
  });
});

import { describe, expect, it } from "vitest";
import {
  applyPartnerDirectoryFilters,
  parsePartnerDirectoryFilters
} from "./partner-directory-filters";

describe("partner directory URL filters", () => {
  it("parses shareable selection, filters, sort and mobile view", () => {
    expect(
      parsePartnerDirectoryFilters(
        new URLSearchParams(
          "partner=la-plata&category=restaurant&area=Benajarafe&featured=true&sort=scans&view=list"
        )
      )
    ).toMatchObject({
      partner: "la-plata",
      category: "restaurant",
      area: "Benajarafe",
      featured: true,
      sort: "scans",
      view: "list"
    });
  });

  it("preserves unrelated referral context while clearing defaults", () => {
    const result = applyPartnerDirectoryFilters(
      new URLSearchParams("ref=abc&sort=scans&view=list"),
      { sort: "bookings", view: "map", category: "restaurant" }
    );
    expect(result.toString()).toBe("ref=abc&category=restaurant");
  });
});

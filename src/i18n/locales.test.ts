import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, ENABLED_LOCALES, isAppLocale } from "./locales";

describe("locale registry", () => {
  it("exposes only enabled locales", () => {
    expect(ENABLED_LOCALES).toEqual(["en"]);
    expect(DEFAULT_LOCALE).toBe("en");
    expect(isAppLocale("en")).toBe(true);
    expect(isAppLocale("xx")).toBe(false);
  });
});

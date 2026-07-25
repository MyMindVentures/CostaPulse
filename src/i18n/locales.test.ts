import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  ENABLED_LOCALES,
  isAppLocale,
  resolveAppLocale
} from "./locales";

describe("locale registry", () => {
  it("exposes enabled European locales", () => {
    expect(ENABLED_LOCALES).toEqual(["en", "nl", "fr", "es", "de"]);
    expect(DEFAULT_LOCALE).toBe("en");
    expect(isAppLocale("nl")).toBe(true);
    expect(isAppLocale("xx")).toBe(false);
  });

  it("resolves unknown values to the default locale", () => {
    expect(resolveAppLocale("fr")).toBe("fr");
    expect(resolveAppLocale("xx")).toBe("en");
    expect(resolveAppLocale(undefined)).toBe("en");
  });
});

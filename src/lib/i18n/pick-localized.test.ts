import { describe, expect, it } from "vitest";
import { pickLocalizedFields, pickLocalizedString } from "./pick-localized";

const translations = [
  {
    locale: "en",
    title: "Boat Experience",
    short_description: "English short",
    highlights: ["A", "B"]
  },
  {
    locale: "nl",
    title: "Boot Experience",
    short_description: "Nederlandse short",
    highlights: ["X", "Y"]
  }
];

describe("pickLocalizedFields", () => {
  it("prefers the requested locale", () => {
    const result = pickLocalizedFields({
      locale: "nl",
      translations,
      base: {
        title: "Base title",
        short_description: "Base short",
        highlights: ["base"]
      },
      stringKeys: ["title", "short_description"],
      arrayKeys: ["highlights"]
    });

    expect(result).toEqual({
      title: "Boot Experience",
      short_description: "Nederlandse short",
      highlights: ["X", "Y"]
    });
  });

  it("falls back to English then base columns", () => {
    const english = pickLocalizedFields({
      locale: "fr",
      translations,
      base: {
        title: "Base title",
        short_description: null as string | null
      },
      stringKeys: ["title", "short_description"]
    });
    expect(english.title).toBe("Boat Experience");
    expect(english.short_description).toBe("English short");

    const baseOnly = pickLocalizedFields({
      locale: "de",
      translations: [],
      base: {
        title: "Base title",
        description: "Base description"
      },
      stringKeys: ["title", "description"]
    });
    expect(baseOnly.title).toBe("Base title");
    expect(baseOnly.description).toBe("Base description");
  });
});

describe("pickLocalizedString", () => {
  it("resolves name fields for variants", () => {
    expect(
      pickLocalizedString({
        locale: "nl",
        translations: [
          { locale: "en", name: "3 Hours" },
          { locale: "nl", name: "3 uur" }
        ],
        field: "name",
        fallback: "fallback"
      })
    ).toBe("3 uur");
  });
});

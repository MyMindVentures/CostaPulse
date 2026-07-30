import { describe, expect, it } from "vitest";
import { formatApplicationDocumentLanguage } from "./application-document-format";

describe("formatApplicationDocumentLanguage", () => {
  it("localizes language metadata without exposing raw tokens", () => {
    expect(formatApplicationDocumentLanguage("en", "nl")).toBe("Engels");
    expect(formatApplicationDocumentLanguage("fr", "de")).toBe("Französisch");
  });

  it("renders a truthful missing value", () => {
    expect(formatApplicationDocumentLanguage(null, "en")).toBe("—");
  });
});

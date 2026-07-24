import { describe, expect, it } from "vitest";
import { DEFAULT_MAP_STYLE_URL, resolveMapStyleUrl } from "./config";

describe("resolveMapStyleUrl", () => {
  it("returns the default OpenFreeMap style when unset", () => {
    expect(resolveMapStyleUrl(undefined)).toBe(DEFAULT_MAP_STYLE_URL);
    expect(resolveMapStyleUrl("")).toBe(DEFAULT_MAP_STYLE_URL);
  });

  it("accepts https style URLs", () => {
    expect(resolveMapStyleUrl("https://example.com/style.json")).toBe(
      "https://example.com/style.json"
    );
  });

  it("rejects non-https values", () => {
    expect(resolveMapStyleUrl("http://insecure.example/style.json")).toBe(
      DEFAULT_MAP_STYLE_URL
    );
  });
});

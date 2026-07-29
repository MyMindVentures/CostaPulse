import { describe, expect, it } from "vitest";
import { resolveNoticeKey } from "@/features/auth/login-notices";

describe("resolveNoticeKey", () => {
  it("maps known required reason to default notice", () => {
    expect(resolveNoticeKey("required")).toEqual({
      titleKey: "login.authNoticeRequiredTitle",
      descriptionKey: "login.authNoticeRequiredDescription",
      variant: "default"
    });
  });

  it("maps forbidden reason to destructive notice", () => {
    expect(resolveNoticeKey("forbidden")).toEqual({
      titleKey: "login.authNoticeForbiddenTitle",
      descriptionKey: "login.authNoticeForbiddenDescription",
      variant: "destructive"
    });
  });

  it("returns null for unknown reasons", () => {
    expect(resolveNoticeKey("other")).toBeNull();
    expect(resolveNoticeKey(undefined)).toBeNull();
  });
});

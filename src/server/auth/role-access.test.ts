import { describe, expect, it } from "vitest";
import {
  canAccessAdminArea,
  isAdminRole,
  isTeamRole,
  resolveNavAudience
} from "./role-access";

describe("isAdminRole", () => {
  it("allows operational and administrative roles", () => {
    expect(isAdminRole("operations_staff")).toBe(true);
    expect(isAdminRole("customer_support")).toBe(true);
    expect(isAdminRole("finance_manager")).toBe(true);
    expect(isAdminRole("content_manager")).toBe(true);
    expect(isAdminRole("administrator")).toBe(true);
    expect(isAdminRole("super_administrator")).toBe(true);
  });

  it("rejects customer-facing and provider-facing roles", () => {
    expect(isAdminRole("customer")).toBe(false);
    expect(isAdminRole("experience_provider")).toBe(false);
    expect(isAdminRole("team_member")).toBe(false);
    expect(isAdminRole("partner")).toBe(false);
  });
});

describe("canAccessAdminArea", () => {
  it("grants access when any allowed role is present", () => {
    expect(canAccessAdminArea(["customer", "operations_staff"])).toBe(true);
  });

  it("denies access when no allowed role is present", () => {
    expect(canAccessAdminArea(["customer", "partner"])).toBe(false);
    expect(canAccessAdminArea([])).toBe(false);
  });
});

describe("isTeamRole", () => {
  it("recognizes provider and partner roles", () => {
    expect(isTeamRole("experience_provider")).toBe(true);
    expect(isTeamRole("team_member")).toBe(true);
    expect(isTeamRole("partner")).toBe(true);
    expect(isTeamRole("customer")).toBe(false);
  });
});

describe("resolveNavAudience", () => {
  it("prefers admin over team and customer", () => {
    expect(
      resolveNavAudience(["customer", "experience_provider", "administrator"])
    ).toBe("admin");
  });

  it("maps team roles before customer", () => {
    expect(resolveNavAudience(["customer", "partner"])).toBe("team");
  });

  it("defaults authenticated users without elevated roles to customer", () => {
    expect(resolveNavAudience(["customer"])).toBe("customer");
    expect(resolveNavAudience([])).toBe("customer");
    expect(resolveNavAudience(null)).toBe("customer");
  });
});

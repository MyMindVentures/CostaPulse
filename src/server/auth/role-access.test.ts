import { describe, expect, it } from "vitest";
import {
  canAccessAdminArea,
  canAccessAdminSection,
  canMutateAdminSlots,
  canMutateBookingStatus,
  filterAdminNavSections,
  getPostLoginPath,
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

describe("admin section capabilities", () => {
  it("hides bookings and customers from content managers", () => {
    expect(canAccessAdminSection(["content_manager"], "overview")).toBe(true);
    expect(canAccessAdminSection(["content_manager"], "calendar")).toBe(true);
    expect(canAccessAdminSection(["content_manager"], "bookings")).toBe(false);
    expect(canAccessAdminSection(["content_manager"], "customers")).toBe(false);
  });

  it("allows finance to see bookings but not mutate slots", () => {
    expect(canAccessAdminSection(["finance_manager"], "bookings")).toBe(true);
    expect(canMutateAdminSlots(["finance_manager"])).toBe(false);
    expect(canMutateBookingStatus(["finance_manager"])).toBe(false);
  });

  it("allows operations to mutate slots and booking status", () => {
    expect(canMutateAdminSlots(["operations_staff"])).toBe(true);
    expect(canMutateBookingStatus(["operations_staff"])).toBe(true);
  });

  it("filters nav sections by role", () => {
    expect(
      filterAdminNavSections(
        ["content_manager"],
        ["overview", "bookings", "calendar", "customers"]
      )
    ).toEqual(["overview", "calendar"]);
    expect(
      filterAdminNavSections(
        ["content_manager"],
        [
          "overview",
          "experiences",
          "media",
          "partners",
          "locations",
          "team",
          "bookings",
          "calendar",
          "customers"
        ]
      )
    ).toEqual([
      "overview",
      "experiences",
      "media",
      "partners",
      "locations",
      "team",
      "calendar"
    ]);
  });
});

describe("getPostLoginPath", () => {
  it("routes by audience", () => {
    expect(getPostLoginPath(["administrator"])).toBe("/admin");
    expect(getPostLoginPath(["partner"])).toBe("/partner");
    expect(getPostLoginPath(["customer"])).toBe("/account");
  });
});

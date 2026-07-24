import { describe, expect, it } from "vitest";
import {
  getAccountNav,
  getPrimaryCta,
  getPrimaryNavItems,
  isNavItemActive,
  PRIMARY_NAV_ITEMS
} from "./navigation";

describe("isNavItemActive", () => {
  it("matches exact paths", () => {
    expect(isNavItemActive("/experiences", "/experiences")).toBe(true);
    expect(isNavItemActive("/about", "/about")).toBe(true);
    expect(isNavItemActive("/about", "/partners")).toBe(false);
  });

  it("matches nested experience routes but not the map route", () => {
    expect(isNavItemActive("/experiences", "/experiences/sunset-sail")).toBe(
      true
    );
    expect(isNavItemActive("/experiences", "/experiences/map")).toBe(false);
    expect(isNavItemActive("/experiences/map", "/experiences/map")).toBe(true);
  });

  it("includes the map nav item", () => {
    expect(PRIMARY_NAV_ITEMS.some((item) => item.id === "map")).toBe(true);
  });

  it("only treats home as active on root", () => {
    expect(isNavItemActive("/", "/")).toBe(true);
    expect(isNavItemActive("/", "/experiences")).toBe(false);
  });
});

describe("navigation config", () => {
  it("exposes the same primary items for every audience", () => {
    expect(getPrimaryNavItems("guest")).toEqual(PRIMARY_NAV_ITEMS);
    expect(getPrimaryNavItems("customer")).toEqual(PRIMARY_NAV_ITEMS);
    expect(getPrimaryNavItems("team")).toEqual(PRIMARY_NAV_ITEMS);
    expect(getPrimaryNavItems("admin")).toEqual(PRIMARY_NAV_ITEMS);
  });

  it("varies the account slot by audience", () => {
    expect(getAccountNav("guest").labelKey).toBe("login");
    expect(getAccountNav("customer").labelKey).toBe("account");
    expect(getAccountNav("admin").labelKey).toBe("admin");
  });

  it("points the primary CTA at experiences", () => {
    expect(getPrimaryCta("guest").href).toBe("/experiences");
  });
});

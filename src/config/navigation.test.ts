import { describe, expect, it } from "vitest";
import {
  getAccountNav,
  isNavHrefActive,
  isNavItemTreeActive
} from "./navigation";

describe("isNavHrefActive", () => {
  it("matches exact paths", () => {
    expect(isNavHrefActive("/experiences", "/experiences")).toBe(true);
    expect(isNavHrefActive("/about", "/about")).toBe(true);
    expect(isNavHrefActive("/about", "/partners")).toBe(false);
  });

  it("matches nested experience routes but not the map route by default", () => {
    expect(isNavHrefActive("/experiences", "/experiences/sunset-sail")).toBe(
      true
    );
    expect(isNavHrefActive("/experiences", "/experiences/map")).toBe(false);
    expect(isNavHrefActive("/experiences/map", "/experiences/map")).toBe(true);
  });

  it("can include map under experiences when requested", () => {
    expect(
      isNavHrefActive("/experiences", "/experiences/map", { includeMap: true })
    ).toBe(true);
  });

  it("only treats home as active on root", () => {
    expect(isNavHrefActive("/", "/")).toBe(true);
    expect(isNavHrefActive("/", "/experiences")).toBe(false);
  });
});

describe("isNavItemTreeActive", () => {
  const experiences = {
    href: "/experiences",
    children: [{ href: "/experiences" }, { href: "/experiences/map" }]
  };

  it("marks parent active for map child routes", () => {
    expect(isNavItemTreeActive(experiences, "/experiences/map")).toBe(true);
    expect(isNavItemTreeActive(experiences, "/experiences/sunset")).toBe(true);
  });

  it("marks flat items by href", () => {
    expect(isNavItemTreeActive({ href: "/services" }, "/services")).toBe(true);
    expect(isNavItemTreeActive({ href: "/services" }, "/about")).toBe(false);
  });
});

describe("account nav", () => {
  it("varies the account slot by audience", () => {
    expect(getAccountNav("guest").labelKey).toBe("login");
    expect(getAccountNav("customer").labelKey).toBe("account");
    expect(getAccountNav("admin").labelKey).toBe("admin");
  });
});

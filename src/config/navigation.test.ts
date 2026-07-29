import { describe, expect, it } from "vitest";
import {
  DASHBOARD_NAVIGATION,
  getAccountNav,
  getAdminDashboardNavItems,
  isNavHrefActive,
  isNavItemTreeActive
} from "./navigation";

describe("dashboard navigation", () => {
  it("keeps clean public URLs for each protected area", () => {
    expect(DASHBOARD_NAVIGATION.account.map((item) => item.href)).toEqual([
      "/account",
      "/account/bookings"
    ]);
    expect(DASHBOARD_NAVIGATION.partner.map((item) => item.href)).toEqual([
      "/partner",
      "/partner/qr"
    ]);
    expect(DASHBOARD_NAVIGATION.admin.map((item) => item.href)).toEqual([
      "/admin",
      "/admin/experiences",
      "/admin/media",
      "/admin/documents/shares",
      "/admin/partners",
      "/admin/locations",
      "/admin/team",
      "/admin/bookings",
      "/admin/booking-stories",
      "/admin/calendar",
      "/admin/customers"
    ]);
  });
});

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

  it("only treats dashboard roots as active on their exact path", () => {
    expect(isNavHrefActive("/admin", "/admin")).toBe(true);
    expect(isNavHrefActive("/admin", "/admin/bookings")).toBe(false);
    expect(isNavHrefActive("/admin/bookings", "/admin/bookings/abc")).toBe(
      true
    );
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
    expect(getAccountNav("guest").href).toBe("/login");
    expect(getAccountNav("customer").labelKey).toBe("account");
    expect(getAccountNav("admin").labelKey).toBe("admin");
  });
});

describe("getAdminDashboardNavItems", () => {
  it("filters admin nav by allowed sections", () => {
    expect(
      getAdminDashboardNavItems(["overview", "calendar"]).map(
        (item) => item.href
      )
    ).toEqual(["/admin", "/admin/calendar"]);
  });
});

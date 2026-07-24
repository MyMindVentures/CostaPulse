/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NavDropdown } from "./NavDropdown";
import type { SiteNavItem } from "@/lib/view-models/site-navigation";

afterEach(() => cleanup());

const item: SiteNavItem = {
  id: "a1000000-0000-4000-8000-000000000001",
  key: "experiences",
  href: "/experiences",
  label: "Experiences",
  isExternal: false,
  children: [
    {
      id: "a1000000-0000-4000-8000-000000000002",
      key: "experiences_all",
      href: "/experiences",
      label: "All experiences",
      isExternal: false
    },
    {
      id: "a1000000-0000-4000-8000-000000000003",
      key: "experiences_map",
      href: "/experiences/map",
      label: "Explore map",
      isExternal: false
    }
  ]
};

describe("NavDropdown", () => {
  it("opens the menu and marks the active child", () => {
    render(<NavDropdown item={item} pathname="/experiences/map" />);

    const trigger = screen.getByRole("button", { name: /Experiences/i });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.className).toContain("is-active");

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    const mapLink = screen.getByRole("menuitem", { name: /Explore map/i });
    expect(mapLink.getAttribute("aria-current")).toBe("page");
  });

  it("closes on Escape", () => {
    render(<NavDropdown item={item} pathname="/experiences" />);
    fireEvent.click(screen.getByRole("button", { name: /Experiences/i }));
    expect(screen.getByRole("menu")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });
});

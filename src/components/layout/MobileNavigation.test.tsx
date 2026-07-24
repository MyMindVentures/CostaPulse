/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import { MobileNavigation } from "./MobileNavigation";
import messages from "../../../messages/en.json";
import type { SiteNavigationViewModel } from "@/lib/view-models/site-navigation";

vi.mock("next/navigation", () => ({
  usePathname: () => "/experiences",
  useSearchParams: () => new URLSearchParams()
}));

afterEach(() => cleanup());

const navigation: SiteNavigationViewModel = {
  primary: [
    {
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
    },
    {
      id: "a1000000-0000-4000-8000-000000000004",
      key: "services",
      href: "/services",
      label: "Services",
      isExternal: false,
      children: []
    },
    {
      id: "a1000000-0000-4000-8000-000000000007",
      key: "about",
      href: "/about",
      label: "About",
      isExternal: false,
      children: []
    }
  ],
  cta: {
    id: "a1000000-0000-4000-8000-000000000008",
    key: "book_experience",
    href: "/experiences",
    label: "Book Experience",
    isExternal: false
  }
};

function renderDrawer(open: boolean, onClose = vi.fn()) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <MobileNavigation
        mounted={open}
        open={open}
        onClose={onClose}
        pathname="/experiences"
        audience="guest"
        navigation={navigation}
        overlayTone={false}
      />
    </NextIntlClientProvider>
  );
}

describe("MobileNavigation", () => {
  it("renders nothing when closed", () => {
    const { container } = renderDrawer(false);
    expect(container.querySelector(".mobile-nav")).toBeNull();
  });

  it("closes via overlay click and Escape", () => {
    const onClose = vi.fn();
    renderDrawer(true, onClose);

    fireEvent.click(
      screen.getByRole("button", { name: /Dismiss navigation menu/i })
    );
    expect(onClose).toHaveBeenCalled();

    onClose.mockClear();
    cleanup();
    renderDrawer(true, onClose);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("marks active child routes and closes when a leaf link is chosen", () => {
    const onClose = vi.fn();
    renderDrawer(true, onClose);

    expect(
      screen
        .getByRole("link", { name: /^All experiences$/i })
        .getAttribute("aria-current")
    ).toBe("page");

    fireEvent.click(screen.getByRole("link", { name: /^About$/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("exposes Services and Book Experience from the view model", () => {
    renderDrawer(true);
    expect(screen.getByRole("link", { name: /^Services$/i })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /^Book Experience$/i })
    ).toBeTruthy();
  });
});

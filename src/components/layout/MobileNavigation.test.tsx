/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import { MobileNavigation } from "./MobileNavigation";
import messages from "../../../messages/en.json";

vi.mock("next/navigation", () => ({
  usePathname: () => "/experiences",
  useSearchParams: () => new URLSearchParams()
}));

afterEach(() => cleanup());

function renderDrawer(open: boolean, onClose = vi.fn()) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <MobileNavigation
        open={open}
        onClose={onClose}
        pathname="/experiences"
        audience="guest"
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

  it("marks the active route and closes when a link is chosen", () => {
    const onClose = vi.fn();
    renderDrawer(true, onClose);

    const experiences = screen.getByRole("link", { name: /^Experiences$/i });
    expect(experiences.getAttribute("aria-current")).toBe("page");

    fireEvent.click(screen.getByRole("link", { name: /^About$/i }));
    expect(onClose).toHaveBeenCalled();
  });
});

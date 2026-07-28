import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  RoleAccordionGroup,
  type RoleAccordionItem
} from "./role-accordion-group";
import type { StrategyCardViewModel } from "./strategy-view-model";

function strategy(id: string): StrategyCardViewModel {
  return {
    id,
    slug: id,
    audience_key: id.split("-")[0] ?? "customer",
    user_role: null,
    stakeholder_key: null,
    title: "Strategy title",
    summary: `Summary for ${id}`,
    description: `Why ${id} matters`,
    strategy_type: "ecosystem",
    status: "published",
    priority: 1,
    objective: `Gain for ${id}`,
    target_audience: [],
    channels: [],
    win_win: [],
    sort_order: 1,
    metadata: {},
    metrics: [],
    actionSteps: [],
    missionStatements: [],
    voucherBasisPoints: null
  };
}

const items: RoleAccordionItem[] = [
  { role: "founder", label: "Founder", strategy: strategy("founder-strategy") },
  {
    role: "customer",
    label: "Customer",
    strategy: strategy("customer-strategy")
  }
];

const labels = { gain: "What they gain", matters: "Why it matters" };

beforeEach(() => {
  window.history.replaceState(null, "", "/why-costapulse");
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(0);
    return 1;
  });
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("RoleAccordionGroup", () => {
  it("uses semantic controls and keeps only one role open", () => {
    render(<RoleAccordionGroup items={items} labels={labels} />);

    const founder = screen.getByRole("button", { name: /Founder/ });
    const customer = screen.getByRole("button", { name: /Customer/ });
    expect(founder).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(founder);
    expect(founder).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Gain for founder-strategy")).toBeVisible();

    fireEvent.click(customer);
    expect(founder).toHaveAttribute("aria-expanded", "false");
    expect(customer).toHaveAttribute("aria-expanded", "true");
    expect(screen.queryByText("Gain for founder-strategy")).not.toBeVisible();
  });

  it("opens and scrolls to a matching direct-link hash", () => {
    window.history.replaceState(null, "", "/why-costapulse#customer-strategy");
    render(<RoleAccordionGroup items={items} labels={labels} />);

    expect(screen.getByRole("button", { name: /Customer/ })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start"
    });
  });

  it("responds to browser hash navigation", () => {
    render(<RoleAccordionGroup items={items} labels={labels} />);
    window.history.pushState(null, "", "#founder-strategy");
    fireEvent(window, new HashChangeEvent("hashchange"));

    expect(screen.getByRole("button", { name: /Founder/ })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("avoids smooth scrolling when reduced motion is requested", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    window.history.replaceState(null, "", "/why-costapulse#customer-strategy");
    render(<RoleAccordionGroup items={items} labels={labels} />);

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start"
    });
  });
});

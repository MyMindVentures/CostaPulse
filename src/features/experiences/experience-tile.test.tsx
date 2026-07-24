/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ExperienceTile } from "./experience-tile";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("ExperienceTile", () => {
  it("renders mockup card fields without a rating row when reviews are absent", () => {
    render(
      <ExperienceTile
        experienceId="exp-1"
        title="Private Yacht Experience"
        description="A private Mediterranean boat day."
        href="/experiences/boat-experience"
        ctaLabel="View details"
        imageAlt="Private Yacht Experience"
        categoryLabel="Yacht Experience"
        categoryIcon="boat"
        favoriteLabel="Save this experience"
        fromLabel="From"
        priceAmount="€495"
        priceUnit="per experience"
        metaItems={[
          { icon: "duration", label: "4 hours" },
          { icon: "capacity", label: "Up to 8 guests" },
          { icon: "feature", label: "Skipper included" },
          { icon: "feature", label: "Fuel options" }
        ]}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Private Yacht Experience" })
    ).toBeTruthy();
    expect(screen.getByText("Yacht Experience")).toBeTruthy();
    expect(screen.getByText("€495")).toBeTruthy();
    expect(screen.getByText("per experience")).toBeTruthy();
    expect(screen.getByText("Skipper included")).toBeTruthy();
    expect(screen.queryByText(/reviews/i)).toBeNull();
    expect(screen.queryByText("5.0")).toBeNull();
  });

  it("renders published rating summary when review data is provided", () => {
    render(
      <ExperienceTile
        title="Boat Experience"
        description="A private Mediterranean boat experience."
        href="/experiences/boat-experience"
        ctaLabel="View details"
        imageAlt="Boat Experience"
        averageRating={4.5}
        reviewCount={2}
        reviewCountLabel="(2 reviews)"
      />
    );

    expect(screen.getByText("4.5")).toBeTruthy();
    expect(screen.getByText("(2 reviews)")).toBeTruthy();
  });

  it("toggles favorite state in localStorage", () => {
    render(
      <ExperienceTile
        experienceId="exp-2"
        title="Paddleboard Adventure"
        description="Guided paddle session."
        href="/experiences/paddlesurf-mentor"
        ctaLabel="View details"
        imageAlt="Paddleboard Adventure"
        favoriteLabel="Save this experience"
      />
    );

    const button = screen.getByRole("button", {
      name: "Save this experience"
    });
    expect(button.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(window.localStorage.getItem("costapulse.favorite-experiences")).toBe(
      JSON.stringify(["exp-2"])
    );

    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });
});

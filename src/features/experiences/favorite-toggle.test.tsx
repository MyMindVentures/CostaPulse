/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FavoriteToggle } from "./favorite-toggle";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("FavoriteToggle", () => {
  it("toggles favorite state in localStorage", () => {
    render(
      <FavoriteToggle experienceId="exp-2" label="Save this experience" />
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

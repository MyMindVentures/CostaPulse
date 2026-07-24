import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingState } from "./loading-state";

describe("LoadingState", () => {
  it("exposes an accessible busy status label", () => {
    render(<LoadingState label="Loading experiences" rows={2} />);

    expect(
      screen.getByRole("status", { name: "Loading experiences" })
    ).toHaveAttribute("aria-busy", "true");
  });
});

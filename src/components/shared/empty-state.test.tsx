import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders title only for a minimal empty catalog", () => {
    render(<EmptyState title="No experiences found" />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "No experiences found"
    );
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders description and action for a recoverable empty state", () => {
    render(
      <EmptyState
        title="No experiences found"
        description="Try another destination."
        actionLabel="Browse catalog"
        actionHref="/experiences"
      />
    );

    expect(screen.getByText("Try another destination.")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Browse catalog" })
    ).toHaveAttribute("href", "/experiences");
  });
});

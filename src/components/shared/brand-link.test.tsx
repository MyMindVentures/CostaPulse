import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandLink } from "./brand-link";

describe("BrandLink", () => {
  it("preserves the square aspect ratio of the catalogued CostaPulse logo", () => {
    render(
      <BrandLink
        logoSrc="https://example.supabase.co/storage/v1/object/public/brand-assets/logos/CostaPulse%20Logo.png"
        logoAlt="CostaPulse"
      />
    );

    const logo = screen.getByRole("img", { name: "CostaPulse" });

    expect(logo).toHaveAttribute("width", "256");
    expect(logo).toHaveAttribute("height", "256");
  });
});

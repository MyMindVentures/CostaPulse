import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("container", "readiness-grid")).toBe("container readiness-grid");
  });

  it("ignores falsy values", () => {
    expect(cn("container", false && "hidden", undefined, "mt-4")).toBe(
      "container mt-4"
    );
  });

  it("resolves conflicting Tailwind classes with the last wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});

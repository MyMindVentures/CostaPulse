import { describe, expect, it } from "vitest";
import { getPostLoginPath } from "./role-access";

describe("getPostLoginPath", () => {
  it("sends administrators to /admin", () => {
    expect(getPostLoginPath(["super_administrator"])).toBe("/admin");
    expect(getPostLoginPath(["operations_staff"])).toBe("/admin");
  });

  it("sends team roles to /partner", () => {
    expect(getPostLoginPath(["partner"])).toBe("/partner");
    expect(getPostLoginPath(["experience_provider"])).toBe("/partner");
  });

  it("defaults customers to /account", () => {
    expect(getPostLoginPath(["customer"])).toBe("/account");
    expect(getPostLoginPath([])).toBe("/account");
  });
});

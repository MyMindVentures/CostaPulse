import { describe, expect, it } from "vitest";
import {
  getStrategyRoleFromAnchor,
  resolveStrategyRoleKey,
  STRATEGY_ROLE_DISPLAY_MAP
} from "./role-display-map";

describe("strategy role display mapping", () => {
  it("maps every public role to a readable-label key and stable anchor", () => {
    expect(STRATEGY_ROLE_DISPLAY_MAP).toEqual({
      founder: { anchor: "founder-strategy", labelKey: "roles.founder" },
      partner: { anchor: "partner-strategy", labelKey: "roles.partner" },
      customer: { anchor: "customer-strategy", labelKey: "roles.customer" },
      experience_provider: {
        anchor: "experience-provider-strategy",
        labelKey: "roles.experienceProvider"
      },
      team_member: {
        anchor: "team-member-strategy",
        labelKey: "roles.teamMember"
      }
    });
  });

  it("resolves supported role candidates without leaking unknown keys", () => {
    expect(resolveStrategyRoleKey(" customer ")).toBe("customer");
    expect(resolveStrategyRoleKey("unknown", "team_member")).toBe(
      "team_member"
    );
    expect(resolveStrategyRoleKey("internal_role")).toBeNull();
  });

  it("resolves direct-link hashes to roles", () => {
    expect(getStrategyRoleFromAnchor("#customer-strategy")).toBe("customer");
    expect(getStrategyRoleFromAnchor("team-member-strategy")).toBe(
      "team_member"
    );
    expect(getStrategyRoleFromAnchor("unknown-strategy")).toBeNull();
  });
});

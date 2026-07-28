import { describe, expect, it } from "vitest";
import { parseStrategyRows } from "./strategy-view-model";

const validRow = {
  audience_key: "partner",
  user_role: "Partner",
  stakeholder_key: "local_partner",
  title: "Shared local growth",
  summary: "A shared-value strategy",
  description: null,
  objective: "Create measurable mutual value",
  target_audience: [],
  channels: [],
  success_metrics: ["Returning customers"],
  action_plan: ["Recommend CostaPulse"],
  win_win: [
    {
      beneficiary_role: "Customer",
      benefit: "A reason to return",
      motivation: "Local value stays visible"
    }
  ],
  mission_statements: ["Grow together"],
  sort_order: 1,
  status: "active",
  priority: "high",
  metadata: { ecosystem_loop: ["Partner recommends CostaPulse"] }
};

describe("parseStrategyRows", () => {
  it("normalizes mission statements and a supported ecosystem loop", () => {
    const [strategy] = parseStrategyRows([validRow]);
    expect(strategy?.mission_statements[0]?.statement).toBe("Grow together");
    expect(strategy?.ecosystemLoop).toEqual(["Partner recommends CostaPulse"]);
  });

  it("rejects malformed win-win content at the backend boundary", () => {
    expect(() =>
      parseStrategyRows([
        { ...validRow, win_win: [{ beneficiary_role: "Customer" }] }
      ])
    ).toThrow();
  });

  it("supports one record with absent optional content", () => {
    const [strategy] = parseStrategyRows([
      {
        ...validRow,
        metadata: null,
        description: null,
        win_win: [],
        mission_statements: []
      }
    ]);
    expect(strategy?.ecosystemLoop).toEqual([]);
    expect(strategy?.description).toBeNull();
  });
});

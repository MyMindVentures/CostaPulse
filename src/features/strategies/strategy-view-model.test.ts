import { describe, expect, it } from "vitest";
import { parseStrategyRows } from "./strategy-view-model";
import { STRATEGY_ROLE_KEYS } from "./role-display-map";

function row(role: (typeof STRATEGY_ROLE_KEYS)[number], sortOrder: number) {
  return {
    slug: `${role}-strategy`,
    audience_key: role,
    user_role: null,
    stakeholder_key: null,
    title: `${role} title`,
    summary: `${role} summary`,
    description: `${role} description`,
    strategy_type: "ecosystem",
    status: "published",
    priority: 10,
    objective: `${role} objective`,
    target_audience: [],
    channels: [],
    success_metrics: { growth: { target: 25, unit: "percent" } },
    action_plan: [
      { step: 2, action: "Measure" },
      { step: 1, action: "Start" }
    ],
    win_win: [
      {
        beneficiary_role: role,
        benefit: `${role} benefit`,
        motivation: `${role} motivation`
      }
    ],
    simple_workflow_steps: [`Start ${role}`, `Complete ${role}`],
    mission_statements: [
      {
        slug: `${role}-mission`,
        title: `${role} mission`,
        statement: `${role} statement`,
        supporting_statement: null,
        principles: [{ key: "local", label: "Keep value local" }],
        relationship_type: "shared_value",
        rationale: null
      }
    ],
    sort_order: sortOrder,
    metadata: { customer_voucher_basis_points: 500 }
  };
}

const fiveRows = STRATEGY_ROLE_KEYS.map((role, index) =>
  row(role, STRATEGY_ROLE_KEYS.length - index)
);

describe("parseStrategyRows", () => {
  it("recognizes all five roles and sorts cards and action steps", () => {
    const page = parseStrategyRows(fiveRows);

    expect(page.strategies).toHaveLength(5);
    expect(page.strategies.map(({ sort_order }) => sort_order)).toEqual([
      1, 2, 3, 4, 5
    ]);
    expect(page.strategies[0]?.actionSteps.map(({ step }) => step)).toEqual([
      1, 2
    ]);
    expect(page.founderStrategy?.audience_key).toBe("founder");
    expect(page.roleStrategies).toHaveLength(4);
    expect(page.primaryMission?.slug).toBe("founder-mission");
  });

  it("parses a distinct non-empty workflow for every role", () => {
    const page = parseStrategyRows(fiveRows);

    expect(
      page.strategies.map((strategy) => strategy.simple_workflow_steps)
    ).toEqual(
      page.strategies.map((strategy) => [
        `Start ${strategy.audience_key}`,
        `Complete ${strategy.audience_key}`
      ])
    );
  });

  it("allows a missing workflow without crashing", () => {
    const rows = fiveRows.map((item, index) =>
      index === 0
        ? (({ simple_workflow_steps: _steps, ...withoutWorkflow }) =>
            withoutWorkflow)(item)
        : item
    );

    expect(
      parseStrategyRows(rows).strategies.at(-1)?.simple_workflow_steps
    ).toEqual([]);
  });

  it.each([[["", "Valid"]], [["Valid", 42]], ["not-an-array"]])(
    "rejects an invalid workflow: %j",
    (simple_workflow_steps) => {
      expect(() =>
        parseStrategyRows([
          { ...fiveRows[0], simple_workflow_steps },
          ...fiveRows.slice(1)
        ])
      ).toThrow();
    }
  );

  it("rejects missing, duplicate, and unknown public roles", () => {
    expect(() => parseStrategyRows(fiveRows.slice(1))).toThrow();
    expect(() =>
      parseStrategyRows([
        { ...fiveRows[0], audience_key: "partner" },
        ...fiveRows.slice(1)
      ])
    ).toThrow();
    expect(() =>
      parseStrategyRows([
        { ...fiveRows[0], audience_key: "visitor" },
        ...fiveRows.slice(1)
      ])
    ).toThrow();
  });

  it("rejects malformed nested content at the backend boundary", () => {
    expect(() =>
      parseStrategyRows([{ ...fiveRows[0], action_plan: ["invalid"] }])
    ).toThrow();
  });

  it("supports an empty read model without fabricating content", () => {
    expect(parseStrategyRows([])).toEqual({
      strategies: [],
      founderStrategy: null,
      roleStrategies: [],
      primaryMission: null
    });
  });
});

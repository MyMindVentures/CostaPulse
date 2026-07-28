import { describe, expect, it } from "vitest";
import { parseStrategyRows } from "./strategy-view-model";

const validRow = {
  slug: "local-partner",
  audience_key: "partner",
  user_role: "Partner",
  stakeholder_key: "local_partner",
  title: "Shared local growth",
  summary: "A shared-value strategy",
  description: null,
  strategy_type: "ecosystem",
  status: "published",
  priority: 10,
  objective: "Create measurable mutual value",
  target_audience: [],
  channels: [],
  success_metrics: { returning_customers: { target: 25, unit: "percent" } },
  action_plan: [
    { step: 2, action: "Measure return visits" },
    { step: 1, action: "Recommend CostaPulse" }
  ],
  win_win: [
    {
      beneficiary_role: "Customer",
      benefit: "A reason to return",
      motivation: "Local value stays visible"
    }
  ],
  mission_statements: [
    {
      slug: "grow-together",
      title: "Shared mission",
      statement: "Grow together",
      supporting_statement: null,
      principles: [{ key: "local", label: "Keep value local" }],
      relationship_type: "shared_value",
      rationale: null
    }
  ],
  sort_order: 1,
  metadata: { customer_voucher_basis_points: 500 }
};

describe("parseStrategyRows", () => {
  it("maps the public read model into sorted, intentional view models", () => {
    const page = parseStrategyRows([validRow]);
    const strategy = page.strategies[0];

    expect(strategy?.id).toBe("local-partner");
    expect(strategy?.actionSteps.map(({ step }) => step)).toEqual([1, 2]);
    expect(strategy?.metrics).toEqual([
      { key: "returning_customers", target: 25, unit: "percent" }
    ]);
    expect(strategy?.missionStatements[0]?.statement).toBe("Grow together");
    expect(strategy?.voucherBasisPoints).toBe(500);
    expect(page.primaryMission?.slug).toBe("grow-together");
  });

  it("prioritizes the founder mission independently of row order", () => {
    const page = parseStrategyRows([
      validRow,
      {
        ...validRow,
        slug: "founder",
        audience_key: "founder",
        sort_order: 2,
        mission_statements: [
          { ...validRow.mission_statements[0], slug: "founder-mission" }
        ]
      }
    ]);

    expect(page.founderStrategy?.slug).toBe("founder");
    expect(page.roleStrategies).toHaveLength(1);
    expect(page.primaryMission?.slug).toBe("founder-mission");
  });

  it("rejects malformed nested content at the backend boundary", () => {
    expect(() =>
      parseStrategyRows([{ ...validRow, action_plan: ["not-an-action"] }])
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

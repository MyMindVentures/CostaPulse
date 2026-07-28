import { z } from "zod";

const text = z.string().trim().min(1);

const winWinSchema = z.object({
  beneficiary_role: text,
  benefit: text,
  motivation: text
});

const actionStepSchema = z.object({
  step: z.number().int(),
  action: text
});

const metricSchema = z.object({
  target: z.number(),
  unit: text
});

const principleSchema = z.object({
  key: text,
  label: text
});

const missionSchema = z.object({
  slug: text,
  title: text,
  statement: text,
  supporting_statement: z.string().trim().nullable().optional(),
  principles: z.array(principleSchema).nullable().optional(),
  relationship_type: text,
  rationale: z.string().trim().nullable().optional()
});

export const strategyRowSchema = z.object({
  slug: text,
  audience_key: text,
  user_role: z.string().trim().nullable().optional(),
  stakeholder_key: z.string().trim().nullable().optional(),
  title: text,
  summary: text,
  description: z.string().trim().nullable().optional(),
  strategy_type: text,
  status: text,
  priority: z.number(),
  objective: text,
  target_audience: z.array(text).default([]),
  channels: z.array(text).default([]),
  success_metrics: z.record(z.string(), metricSchema).default({}),
  action_plan: z.array(actionStepSchema).default([]),
  win_win: z.array(winWinSchema).default([]),
  simple_workflow_steps: z.array(text).default([]),
  mission_statements: z.array(missionSchema).default([]),
  sort_order: z.number().int(),
  metadata: z.record(z.string(), z.unknown()).default({})
});

export type StrategyMetricViewModel = {
  key: string;
  target: number;
  unit: string;
};

export type StrategyMissionViewModel = {
  slug: string;
  title: string;
  statement: string;
  supportingStatement: string | null;
  principles: Array<{ key: string; label: string }>;
  relationshipType: string;
  rationale: string | null;
};

export type StrategyCardViewModel = Omit<
  z.infer<typeof strategyRowSchema>,
  "success_metrics" | "action_plan" | "mission_statements"
> & {
  id: string;
  metrics: StrategyMetricViewModel[];
  actionSteps: Array<{ step: number; action: string }>;
  missionStatements: StrategyMissionViewModel[];
  voucherBasisPoints: number | null;
};

export type StrategyPageViewModel = {
  strategies: StrategyCardViewModel[];
  founderStrategy: StrategyCardViewModel | null;
  roleStrategies: StrategyCardViewModel[];
  primaryMission: StrategyMissionViewModel | null;
};

export function parseStrategyRows(value: unknown): StrategyPageViewModel {
  const rows = z.array(strategyRowSchema).parse(value);
  const strategies = rows
    .map((row): StrategyCardViewModel => {
      const voucherBasisPoints = z
        .number()
        .nonnegative()
        .safeParse(row.metadata.customer_voucher_basis_points);

      return {
        ...row,
        id: row.slug,
        metrics: Object.entries(row.success_metrics).map(([key, metric]) => ({
          key,
          target: metric.target,
          unit: metric.unit
        })),
        actionSteps: [...row.action_plan].sort((a, b) => a.step - b.step),
        missionStatements: row.mission_statements.map((mission) => ({
          slug: mission.slug,
          title: mission.title,
          statement: mission.statement,
          supportingStatement: mission.supporting_statement ?? null,
          principles: mission.principles ?? [],
          relationshipType: mission.relationship_type,
          rationale: mission.rationale ?? null
        })),
        voucherBasisPoints: voucherBasisPoints.success
          ? voucherBasisPoints.data
          : null
      };
    })
    .sort((a, b) => a.sort_order - b.sort_order);

  const founderStrategy =
    strategies.find((strategy) => strategy.audience_key === "founder") ?? null;
  const roleStrategies = strategies.filter(
    (strategy) => strategy.audience_key !== "founder"
  );
  const primaryMission =
    founderStrategy?.missionStatements[0] ??
    strategies.flatMap((strategy) => strategy.missionStatements)[0] ??
    null;

  return {
    strategies,
    founderStrategy,
    roleStrategies,
    primaryMission
  };
}

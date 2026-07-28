import { z } from "zod";

const text = z.string().trim().min(1);

const winWinSchema = z.object({
  beneficiary_role: text,
  benefit: text,
  motivation: text
});

const missionSchema = z.union([
  text.transform((statement) => ({
    title: null,
    statement,
    supportingStatement: null
  })),
  z
    .object({
      title: z.string().trim().nullable().optional(),
      statement: text,
      supporting_statement: z.string().trim().nullable().optional()
    })
    .transform((value) => ({
      title: value.title ?? null,
      statement: value.statement,
      supportingStatement: value.supporting_statement ?? null
    }))
]);

export const strategyRowSchema = z.object({
  audience_key: text,
  user_role: z.string().trim().nullable().optional(),
  stakeholder_key: z.string().trim().nullable().optional(),
  title: text,
  summary: text,
  description: z.string().trim().nullable().optional(),
  objective: text,
  target_audience: z.array(z.string()).nullable().optional(),
  channels: z.array(z.string()).nullable().optional(),
  success_metrics: z.array(z.string()).default([]),
  action_plan: z.array(z.string()).default([]),
  win_win: z.array(winWinSchema).default([]),
  mission_statements: z.array(missionSchema).default([]),
  sort_order: z.number().int(),
  status: z.string().nullable().optional(),
  priority: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional()
});

export type StrategyCardViewModel = z.infer<typeof strategyRowSchema> & {
  id: string;
  ecosystemLoop: string[];
};

export function parseStrategyRows(value: unknown): StrategyCardViewModel[] {
  const rows = z.array(strategyRowSchema).parse(value);
  return rows.map((row, index) => ({
    ...row,
    id: `${row.audience_key}-${row.stakeholder_key ?? row.user_role ?? index}`,
    ecosystemLoop:
      z.array(text).safeParse(row.metadata?.ecosystem_loop).data ?? []
  }));
}

import { z } from "zod";

/**
 * Team member summary shape returned inside map/calendar RPC JSON aggregates.
 */
export const teamMemberSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  displayName: z.string().min(1),
  roleTitle: z.string().nullable().optional().default(null),
  photoPath: z.string().nullable().optional().default(null),
  isPrimary: z.boolean().optional().default(false),
  roleLabel: z.string().nullable().optional().default(null)
});

export type TeamMemberSummary = z.infer<typeof teamMemberSummarySchema>;

export function parseTeamMemberSummaries(value: unknown): TeamMemberSummary[] {
  if (value == null) return [];
  const parsed = z.array(teamMemberSummarySchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

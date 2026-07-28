export const STRATEGY_ROLE_KEYS = [
  "founder",
  "partner",
  "customer",
  "experience_provider",
  "team_member"
] as const;

export type StrategyRoleKey = (typeof STRATEGY_ROLE_KEYS)[number];
export type StrategyRoleLabelKey =
  | "roles.founder"
  | "roles.partner"
  | "roles.customer"
  | "roles.experienceProvider"
  | "roles.teamMember";

type StrategyRoleDisplay = {
  anchor: `${string}-strategy`;
  labelKey: StrategyRoleLabelKey;
};

export const STRATEGY_ROLE_DISPLAY_MAP: Record<
  StrategyRoleKey,
  StrategyRoleDisplay
> = {
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
};

export function resolveStrategyRoleKey(
  ...candidates: Array<string | null | undefined>
): StrategyRoleKey | null {
  for (const candidate of candidates) {
    const normalized = candidate?.trim().toLowerCase();
    if (
      normalized &&
      STRATEGY_ROLE_KEYS.includes(normalized as StrategyRoleKey)
    ) {
      return normalized as StrategyRoleKey;
    }
  }
  return null;
}

export function getStrategyRoleFromAnchor(
  anchor: string
): StrategyRoleKey | null {
  const normalized = anchor.replace(/^#/, "");
  return (
    STRATEGY_ROLE_KEYS.find(
      (role) => STRATEGY_ROLE_DISPLAY_MAP[role].anchor === normalized
    ) ?? null
  );
}

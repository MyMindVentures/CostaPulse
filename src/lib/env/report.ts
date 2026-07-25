type CheckStatus = "configured" | "disabled" | "invalid";

type EnvCheck = {
  name: string;
  status: CheckStatus;
  requiredKeys: readonly string[];
  missingKeys: string[];
};

type EnvReport = {
  ready: boolean;
  checks: EnvCheck[];
};

const envChecks = [
  { name: "siteUrl", requiredKeys: ["NEXT_PUBLIC_SITE_URL"] as const },
  {
    name: "supabasePublic",
    requiredKeys: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    ] as const
  },
  {
    name: "supabaseAdmin",
    requiredKeys: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY"
    ] as const
  },
  { name: "stripeServer", requiredKeys: ["STRIPE_SECRET_KEY"] as const },
  {
    name: "stripeClient",
    requiredKeys: ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"] as const
  },
  { name: "stripeWebhooks", requiredKeys: ["STRIPE_WEBHOOK_SECRET"] as const },
  {
    name: "resend",
    requiredKeys: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"] as const
  },
  {
    name: "sentry",
    requiredKeys: ["NEXT_PUBLIC_SENTRY_DSN", "SENTRY_AUTH_TOKEN"] as const
  },
  {
    name: "posthog",
    requiredKeys: [
      "NEXT_PUBLIC_POSTHOG_KEY",
      "NEXT_PUBLIC_POSTHOG_HOST"
    ] as const
  }
] as const;

function getEnvValue(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : "";
}

function resolveCheck(name: string, requiredKeys: readonly string[]): EnvCheck {
  const presentKeys = requiredKeys.filter((key) => getEnvValue(key));
  const missingKeys = requiredKeys.filter((key) => !getEnvValue(key));

  if (presentKeys.length === 0) {
    return {
      name,
      status: "disabled",
      requiredKeys,
      missingKeys: [...requiredKeys]
    };
  }

  if (missingKeys.length > 0) {
    return { name, status: "invalid", requiredKeys, missingKeys };
  }

  return { name, status: "configured", requiredKeys, missingKeys: [] };
}

export function getServerEnvReport(): EnvReport {
  const checks = envChecks.map(({ name, requiredKeys }) =>
    resolveCheck(name, requiredKeys)
  );
  const siteUrl = checks.find((check) => check.name === "siteUrl");
  const hasInvalidOptionalCheck = checks.some(
    (check) => check.name !== "siteUrl" && check.status === "invalid"
  );

  return {
    ready: siteUrl?.status === "configured" && !hasInvalidOptionalCheck,
    checks
  };
}

export type { EnvCheck, EnvReport };

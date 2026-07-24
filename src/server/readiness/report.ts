import type { EnvCheck } from "@/lib/env/report";

export type DependencyCheckStatus = "configured" | "disabled" | "failed";

export type DependencyCheck = {
  name: string;
  status: DependencyCheckStatus;
  detail: string;
};

type BuildOperatorReadinessInput = {
  envReady: boolean;
  envChecks: EnvCheck[];
  dependencyChecks: DependencyCheck[];
};

export function buildOperatorReadiness({
  envReady,
  envChecks,
  dependencyChecks
}: BuildOperatorReadinessInput) {
  const hasFailedDependency = dependencyChecks.some(
    (check) => check.status === "failed"
  );
  const ready = envReady && !hasFailedDependency;

  return {
    ready,
    status: ready ? ("ready" as const) : ("not_ready" as const),
    checks: {
      env: envChecks,
      dependencies: dependencyChecks
    }
  };
}

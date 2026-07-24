import { NextResponse } from "next/server";
import { getServerEnvReport } from "@/lib/env/server";
import { getSupabaseDependencyCheck } from "@/server/repositories/readiness";
import { buildOperatorReadiness } from "@/server/readiness/report";

export const dynamic = "force-dynamic";

export async function GET() {
  const envReport = getServerEnvReport();
  const supabase = await getSupabaseDependencyCheck();
  const readiness = buildOperatorReadiness({
    envReady: envReport.ready,
    envChecks: envReport.checks,
    dependencyChecks: [supabase]
  });

  return NextResponse.json(
    {
      status: readiness.status,
      check: "readiness",
      service: "costapulse",
      timestamp: new Date().toISOString(),
      checks: readiness.checks
    },
    { status: readiness.ready ? 200 : 503 }
  );
}

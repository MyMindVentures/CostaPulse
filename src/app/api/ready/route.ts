import { NextResponse } from "next/server";
import { getServerEnvReport } from "@/lib/env/server";

export const dynamic = "force-dynamic";

export function GET() {
  const report = getServerEnvReport();

  return NextResponse.json(
    {
      status: report.ready ? "ready" : "not_ready",
      check: "readiness",
      service: "costapulse",
      timestamp: new Date().toISOString(),
      checks: report.checks
    },
    { status: report.ready ? 200 : 503 }
  );
}

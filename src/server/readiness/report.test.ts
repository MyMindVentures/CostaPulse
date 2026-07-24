import { describe, expect, it } from "vitest";
import { buildOperatorReadiness } from "./report";

describe("buildOperatorReadiness", () => {
  it("stays ready when dependencies are disabled cleanly", () => {
    const readiness = buildOperatorReadiness({
      envReady: true,
      envChecks: [
        {
          name: "siteUrl",
          status: "configured",
          requiredKeys: [],
          missingKeys: []
        }
      ],
      dependencyChecks: [
        {
          name: "supabase",
          status: "disabled",
          detail: "Credentials not configured."
        }
      ]
    });

    expect(readiness.ready).toBe(true);
    expect(readiness.status).toBe("ready");
  });

  it("fails readiness when a configured dependency check fails", () => {
    const readiness = buildOperatorReadiness({
      envReady: true,
      envChecks: [
        {
          name: "siteUrl",
          status: "configured",
          requiredKeys: [],
          missingKeys: []
        }
      ],
      dependencyChecks: [
        { name: "supabase", status: "failed", detail: "Probe query failed." }
      ]
    });

    expect(readiness.ready).toBe(false);
    expect(readiness.status).toBe("not_ready");
  });
});

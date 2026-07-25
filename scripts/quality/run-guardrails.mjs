import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const qualityDir = path.dirname(fileURLToPath(import.meta.url));

const checks = [
  "check-i18n.mjs",
  "check-no-production-mocks.mjs",
  "check-route-discoverability.mjs",
  "check-test-companion.mjs",
  "check-stack.mjs"
];

for (const check of checks) {
  const scriptPath = path.join(qualityDir, check);
  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("guardrails: all checks passed");

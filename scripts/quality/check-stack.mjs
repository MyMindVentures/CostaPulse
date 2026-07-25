import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fail } from "./shared.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const packageJsonPath = path.join(root, "package.json");

const REQUIRED_DEV_DEPENDENCIES = [
  "@commitlint/cli",
  "@commitlint/config-conventional",
  "eslint",
  "husky",
  "lint-staged",
  "prettier",
  "typescript",
  "vitest"
];

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const devDependencies = packageJson.devDependencies ?? {};
const dependencies = packageJson.dependencies ?? {};

/** @type {string[]} */
const missing = [];

for (const name of REQUIRED_DEV_DEPENDENCIES) {
  if (!(name in devDependencies) && !(name in dependencies)) {
    missing.push(name);
  }
}

if (!packageJson.scripts?.prepare?.includes("husky")) {
  missing.push('scripts.prepare must run "husky"');
}

if (!packageJson.scripts?.guardrails) {
  missing.push("scripts.guardrails");
}

if (missing.length > 0) {
  fail(
    [
      "check-stack: missing required quality/tooling entries in package.json:",
      ...missing.map((name) => `  - ${name}`)
    ].join("\n")
  );
}

console.log("check-stack: ok");

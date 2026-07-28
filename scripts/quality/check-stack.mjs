import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fail, git, toPosix } from "./shared.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const packageJsonPath = path.join(root, "package.json");
const railwayConfigPath = path.join(root, "railway.json");

const APPROVED_DOCUMENTATION = new Set([
  "AGENTS.md",
  "public/robots.txt",
  "README.md",
  ...Array.from(
    { length: 10 },
    (_, index) =>
      `docs/${String(index + 1).padStart(2, "0")}-${
        [
          "PROJECT-CONTEXT",
          "PRODUCT-SCOPE",
          "ARCHITECTURE",
          "DATABASE",
          "BACKEND",
          "FRONTEND",
          "DESIGN-SYSTEM",
          "DEVOPS",
          "SECURITY",
          "ROADMAP"
        ][index]
      }.md`
  )
]);
const DOCUMENTATION_EXTENSION = /\.(?:md|mdx|rst|txt)$/i;

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
const railwayConfig = JSON.parse(fs.readFileSync(railwayConfigPath, "utf8"));
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

if (railwayConfig.build?.builder === "DOCKERFILE") {
  const dockerfilePath = railwayConfig.build.dockerfilePath ?? "Dockerfile";
  if (!fs.existsSync(path.join(root, dockerfilePath))) {
    missing.push(
      `Railway Dockerfile builder requires the configured ${dockerfilePath}`
    );
  }
}

const unapprovedDocumentation = git("ls-files")
  .split(/\r?\n/)
  .map(toPosix)
  .filter(
    (file) =>
      fs.existsSync(path.join(root, file)) &&
      DOCUMENTATION_EXTENSION.test(file) &&
      !APPROVED_DOCUMENTATION.has(file)
  );

for (const file of unapprovedDocumentation) {
  missing.push(`unapproved documentation file: ${file}`);
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

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fail, getStagedFiles, toPosix } from "./shared.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

const SCOPES = ["src/lib/", "src/server/", "src/i18n/"];

const SKIP_BASENAMES = new Set([
  "index.ts",
  "index.tsx",
  "types.ts",
  "types.tsx",
  "database.ts"
]);

/**
 * @param {string} relativePath
 * @returns {boolean}
 */
function requiresCompanion(relativePath) {
  const posix = toPosix(relativePath);
  if (!SCOPES.some((scope) => posix.startsWith(scope))) {
    return false;
  }
  if (!/\.(ts|tsx)$/.test(posix)) {
    return false;
  }
  if (/\.(test|spec|stories)\.(ts|tsx)$/.test(posix)) {
    return false;
  }
  if (posix.endsWith(".d.ts")) {
    return false;
  }

  const base = path.posix.basename(posix);
  if (SKIP_BASENAMES.has(base)) {
    return false;
  }

  return true;
}

/**
 * @param {string} relativePath
 * @returns {string[]}
 */
function companionCandidates(relativePath) {
  const posix = toPosix(relativePath);
  const dir = path.posix.dirname(posix);
  const parsed = path.posix.parse(posix);
  const stem = parsed.name;

  return [
    path.posix.join(dir, `${stem}.test.ts`),
    path.posix.join(dir, `${stem}.test.tsx`),
    path.posix.join(dir, `${stem}.spec.ts`),
    path.posix.join(dir, `${stem}.spec.tsx`)
  ];
}

/**
 * @param {string} relativePath
 * @returns {boolean}
 */
function hasCompanion(relativePath) {
  return companionCandidates(relativePath).some((candidate) =>
    fs.existsSync(path.join(root, candidate))
  );
}

const staged = getStagedFiles().filter(requiresCompanion);

if (staged.length === 0) {
  console.log("check-test-companion: ok (no scoped staged production files)");
  process.exit(0);
}

const missing = staged.filter((file) => !hasCompanion(file));

if (missing.length > 0) {
  fail(
    [
      "check-test-companion: staged critical modules require a co-located test file:",
      ...missing.map((file) => {
        const candidates = companionCandidates(file)
          .map((candidate) => path.posix.basename(candidate))
          .join(" | ");
        return `  - ${file} (expected ${candidates})`;
      }),
      "",
      "Add a Vitest companion under the same directory, or unstage the file."
    ].join("\n")
  );
}

console.log(`check-test-companion: ok (${staged.length} scoped file(s))`);

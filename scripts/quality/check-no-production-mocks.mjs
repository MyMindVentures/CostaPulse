import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fail, isProductionSource, toPosix } from "./shared.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const srcRoot = path.join(root, "src");

const BANNED_IDENTIFIER_PATTERNS = [
  /\bmockExperiences\b/,
  /\bfakeReviews\b/,
  /\bfakeRatings\b/,
  /\bfakeBookings\b/,
  /\bplaceholderData\b/,
  /\bplaceholderExperiences\b/,
  /\bMOCK_[A-Z0-9_]+\b/,
  /\bFAKE_[A-Z0-9_]+\b/
];

const BANNED_IMPORT_PATTERNS = [
  /from\s+["'][^"']*\.(test|spec|stories)["']/,
  /from\s+["'][^"']*\/(fixtures|__fixtures__|mocks|__mocks__)(?:\/[^"']*)?["']/,
  /import\s+["'][^"']*\.(test|spec|stories)["']/,
  /import\s+["'][^"']*\/(fixtures|__fixtures__|mocks|__mocks__)(?:\/[^"']*)?["']/
];

/**
 * @param {string} dir
 * @returns {string[]}
 */
function walk(dir) {
  /** @type {string[]} */
  const files = [];
  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") {
        continue;
      }
      files.push(...walk(full));
      continue;
    }
    files.push(full);
  }
  return files;
}

/** @type {string[]} */
const violations = [];

for (const absolute of walk(srcRoot)) {
  const relative = toPosix(path.relative(root, absolute));
  if (!isProductionSource(relative)) {
    continue;
  }

  const source = fs.readFileSync(absolute, "utf8");

  for (const pattern of BANNED_IMPORT_PATTERNS) {
    if (pattern.test(source)) {
      violations.push(`${relative}: banned test/fixture/mock import`);
      break;
    }
  }

  for (const pattern of BANNED_IDENTIFIER_PATTERNS) {
    if (pattern.test(source)) {
      violations.push(
        `${relative}: banned mock/placeholder identifier (${pattern})`
      );
      break;
    }
  }
}

if (violations.length > 0) {
  fail(
    [
      "check-no-production-mocks: production code must not ship mocks or test fixtures:",
      ...violations.map((line) => `  - ${line}`)
    ].join("\n")
  );
}

console.log("check-no-production-mocks: ok");

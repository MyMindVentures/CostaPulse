import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fail } from "./shared.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const localesPath = path.join(root, "src/i18n/locales.ts");
const messagesDir = path.join(root, "messages");

/**
 * @param {string} source
 * @returns {string[]}
 */
function parseEnabledLocales(source) {
  const blockMatch = source.match(
    /export const LOCALE_REGISTRY\s*=\s*\[([\s\S]*?)\]\s*as const/
  );
  if (!blockMatch) {
    fail(
      "check-i18n: could not parse LOCALE_REGISTRY from src/i18n/locales.ts"
    );
  }

  const entries = [...blockMatch[1].matchAll(/\{([\s\S]*?)\}/g)];
  /** @type {string[]} */
  const enabled = [];

  for (const entry of entries) {
    const body = entry[1];
    const codeMatch = body.match(/code:\s*["']([^"']+)["']/);
    const enabledMatch = body.match(/enabled:\s*(true|false)/);
    if (!codeMatch || !enabledMatch) {
      continue;
    }
    if (enabledMatch[1] === "true") {
      enabled.push(codeMatch[1]);
    }
  }

  if (enabled.length === 0) {
    fail("check-i18n: no enabled locales found in LOCALE_REGISTRY");
  }

  return enabled;
}

/**
 * @param {unknown} value
 * @param {string} prefix
 * @returns {string[]}
 */
function flattenKeys(value, prefix = "") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  /** @type {string[]} */
  const keys = [];
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === "object" && !Array.isArray(child)) {
      keys.push(...flattenKeys(child, next));
    } else {
      keys.push(next);
    }
  }
  return keys;
}

const localesSource = fs.readFileSync(localesPath, "utf8");
const enabledLocales = parseEnabledLocales(localesSource);

/** @type {Map<string, Set<string>>} */
const catalogKeys = new Map();

for (const locale of enabledLocales) {
  const catalogPath = path.join(messagesDir, `${locale}.json`);
  if (!fs.existsSync(catalogPath)) {
    fail(
      `check-i18n: missing messages catalog for enabled locale "${locale}" (expected messages/${locale}.json)`
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  } catch (error) {
    fail(
      `check-i18n: invalid JSON in messages/${locale}.json: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  catalogKeys.set(locale, new Set(flattenKeys(parsed)));
}

const [baselineLocale, ...otherLocales] = enabledLocales;
const baseline = catalogKeys.get(baselineLocale);
if (!baseline) {
  fail(`check-i18n: baseline catalog missing for ${baselineLocale}`);
}

for (const locale of otherLocales) {
  const keys = catalogKeys.get(locale);
  if (!keys) {
    continue;
  }

  const missing = [...baseline].filter((key) => !keys.has(key)).sort();
  const extra = [...keys].filter((key) => !baseline.has(key)).sort();

  if (missing.length > 0 || extra.length > 0) {
    const lines = [
      `check-i18n: key parity failed between "${baselineLocale}" and "${locale}"`
    ];
    if (missing.length > 0) {
      lines.push(`  missing in ${locale}:`);
      lines.push(...missing.map((key) => `    - ${key}`));
    }
    if (extra.length > 0) {
      lines.push(`  extra in ${locale}:`);
      lines.push(...extra.map((key) => `    - ${key}`));
    }
    fail(lines.join("\n"));
  }
}

console.log(
  `check-i18n: ok (${enabledLocales.join(", ")}; ${baseline.size} keys)`
);

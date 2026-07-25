/**
 * Applies string-level translations onto cloned English catalogs.
 * Run: node scripts/i18n/apply-translations.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TRANSLATIONS } from "./translations-map.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const locales = ["nl", "fr", "es", "de"];

const KEEP = new Set([
  "",
  "#cta",
  "#experiences",
  "#intro",
  "#locations",
  "#trust",
  "01",
  "02",
  "03",
  "{date}",
  "Alicante",
  "Altea",
  "Calpe",
  "Santa Pola",
  "Villajoyosa",
  "Costa Blanca",
  "mailto:hello@costapulse.club",
  "private-charters",
  "coastal-adventures",
  "local-hospitality"
]);

/**
 * @param {unknown} value
 * @param {"nl"|"fr"|"es"|"de"} locale
 * @returns {unknown}
 */
function translateNode(value, locale) {
  if (typeof value === "string") {
    if (KEEP.has(value)) return value;
    const entry = TRANSLATIONS[value];
    if (!entry || !entry[locale]) {
      throw new Error(
        `Missing ${locale} translation for: ${JSON.stringify(value)}`
      );
    }
    return entry[locale];
  }
  if (Array.isArray(value)) {
    return value.map((item) => translateNode(item, locale));
  }
  if (value && typeof value === "object") {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = translateNode(child, locale);
    }
    return out;
  }
  return value;
}

const en = JSON.parse(
  fs.readFileSync(path.join(root, "messages/en.json"), "utf8")
);

for (const locale of locales) {
  const translated = translateNode(en, locale);
  const target = path.join(root, `messages/${locale}.json`);
  fs.writeFileSync(target, `${JSON.stringify(translated, null, 2)}\n`, "utf8");
  console.log(`wrote messages/${locale}.json`);
}

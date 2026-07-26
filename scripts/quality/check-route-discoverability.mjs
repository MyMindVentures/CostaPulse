import { execFileSync } from "node:child_process";
import path from "node:path";
import { fail, toPosix } from "./shared.mjs";

const PAGE_PATTERN = /^src\/app\/.*\/page\.(?:js|jsx|ts|tsx)$/;
const SITEMAP_PATH = "src/app/sitemap.ts";
const NAVIGATION_PATHS = new Set(["src/config/navigation.ts"]);
const FLOW_TERMINALS = new Set(["new", "success", "cancel"]);

/**
 * Read git output without interpolating repository-controlled paths in a shell.
 * @param {string[]} args
 * @returns {string}
 */
function git(args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch {
    return "";
  }
}

/**
 * @param {string} relativePath
 * @returns {string}
 */
function readIndexFile(relativePath) {
  return git(["show", `:${relativePath}`]);
}

/**
 * @returns {string[]}
 */
function stagedNewPages() {
  const output = git([
    "diff",
    "--cached",
    "--name-only",
    "--diff-filter=ACR",
    "--",
    "src/app"
  ]);

  if (!output) {
    return [];
  }

  return output
    .split(/\r?\n/)
    .map(toPosix)
    .filter((file) => PAGE_PATTERN.test(file));
}

/**
 * Convert an App Router page path to its URL path.
 * Route groups and parallel route slots do not contribute URL segments.
 * @param {string} pagePath
 * @returns {string}
 */
function pagePathToRoute(pagePath) {
  const directory = path.posix.dirname(toPosix(pagePath));
  const segments = directory
    .replace(/^src\/app\/?/, "")
    .split("/")
    .filter(
      (segment) =>
        segment &&
        !(segment.startsWith("(") && segment.endsWith(")")) &&
        !segment.startsWith("@")
    );

  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

/**
 * Nested detail/action pages are discoverable through their nearest existing
 * static section parent. Static pages require their own navigation href.
 * @param {string} route
 * @returns {string}
 */
function requiredNavigationHref(route, knownRoutes = new Set()) {
  const segments = route.split("/").filter(Boolean);
  const firstDynamicIndex = segments.findIndex((segment) =>
    segment.startsWith("[")
  );

  if (firstDynamicIndex >= 0) {
    segments.splice(firstDynamicIndex);
    while (segments.length > 1) {
      const candidate = `/${segments.join("/")}`;
      if (knownRoutes.has(candidate)) break;
      segments.pop();
    }
  } else if (segments.length > 1 && FLOW_TERMINALS.has(segments.at(-1) ?? "")) {
    segments.pop();
  }

  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

/**
 * @param {string} pagePath
 * @returns {boolean}
 */
function isIndexablePublicPage(pagePath) {
  const normalized = toPosix(pagePath);
  const route = pagePathToRoute(normalized);
  const pageSource = readIndexFile(normalized);

  return (
    normalized.includes("/(public)/") &&
    route !== "/login" &&
    !/\bindex\s*:\s*false\b/.test(pageSource)
  );
}

/**
 * @param {string} source
 * @param {string} href
 * @returns {boolean}
 */
function containsHref(source, href) {
  const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`["']${escaped}["']`).test(source);
}

const pages = stagedNewPages();

if (pages.length === 0) {
  console.log("check-route-discoverability: ok (no staged new pages)");
  process.exit(0);
}

const trackedFiles = git(["ls-files"])
  .split(/\r?\n/)
  .map(toPosix)
  .filter(Boolean);
const knownPageRoutes = new Set(
  trackedFiles.filter((file) => PAGE_PATTERN.test(file)).map(pagePathToRoute)
);
const navigationFiles = trackedFiles.filter(
  (file) =>
    NAVIGATION_PATHS.has(file) ||
    (file.startsWith("supabase/migrations/") && file.endsWith(".sql"))
);
const navigationSource = navigationFiles
  .map(readIndexFile)
  .filter(Boolean)
  .join("\n");
const sitemapSource = readIndexFile(SITEMAP_PATH);
const stagedFiles = new Set(
  git(["diff", "--cached", "--name-only"])
    .split(/\r?\n/)
    .map(toPosix)
    .filter(Boolean)
);

/** @type {string[]} */
const violations = [];

for (const page of pages) {
  const route = pagePathToRoute(page);
  const navigationHref = requiredNavigationHref(route, knownPageRoutes);

  if (!containsHref(navigationSource, navigationHref)) {
    violations.push(
      `${page}: "${route}" is not reachable from navigation (expected href "${navigationHref}" in site-navigation migration data or src/config/navigation.ts)`
    );
  }

  if (!isIndexablePublicPage(page)) {
    continue;
  }

  if (!stagedFiles.has(SITEMAP_PATH)) {
    violations.push(
      `${page}: new indexable public route "${route}" requires a staged ${SITEMAP_PATH} review/update`
    );
    continue;
  }

  const sitemapHref = route.includes("[") ? navigationHref : route;
  if (!containsHref(sitemapSource, sitemapHref)) {
    violations.push(
      `${page}: new indexable public route "${route}" is not represented in ${SITEMAP_PATH} (expected route or dynamic base "${sitemapHref}")`
    );
  }
}

if (violations.length > 0) {
  fail(
    [
      "check-route-discoverability: every new page must be reachable and sitemap-safe:",
      ...violations.map((violation) => `  - ${violation}`),
      "",
      "Add the route to the appropriate navigation source and update the sitemap in the same commit.",
      "Nested detail/action pages may use their navigated static parent; private and transactional pages stay out of the sitemap."
    ].join("\n")
  );
}

console.log(
  `check-route-discoverability: ok (${pages.length} staged new page(s))`
);

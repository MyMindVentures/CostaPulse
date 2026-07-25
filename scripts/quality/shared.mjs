import { execSync } from "node:child_process";
import path from "node:path";

/**
 * @param {string} command
 * @returns {string}
 */
export function git(command) {
  try {
    return execSync(`git ${command}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch {
    return "";
  }
}

/**
 * Staged paths for pre-commit (Added/Copied/Modified/Renamed).
 * @returns {string[]}
 */
export function getStagedFiles() {
  const output = git("diff --cached --name-only --diff-filter=ACMR");
  if (!output) {
    return [];
  }
  return output.split(/\r?\n/).filter(Boolean);
}

/**
 * @param {string} relativePath
 * @returns {boolean}
 */
export function isProductionSource(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  if (!normalized.startsWith("src/")) {
    return false;
  }
  if (/\.(test|spec|stories)\.(ts|tsx)$/.test(normalized)) {
    return false;
  }
  return /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(normalized);
}

/**
 * @param {string} filePath
 * @returns {string}
 */
export function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

/**
 * @param {string} message
 * @returns {never}
 */
export function fail(message) {
  console.error(message);
  process.exit(1);
}

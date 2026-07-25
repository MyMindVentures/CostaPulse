import { getStagedFiles, fail, toPosix } from "./shared.mjs";

const SECRET_BASENAME_PATTERNS = [
  /^\.env($|\.)/i,
  /^\.env\.local$/i,
  /^\.env\..+\.local$/i,
  /credentials\.json$/i,
  /service[_-]?account\.json$/i,
  /\.pem$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /id_rsa$/i,
  /id_ed25519$/i
];

const ALLOWED_ENV_EXAMPLES = new Set([
  ".env.example",
  ".env.sample",
  ".env.template"
]);

/**
 * @param {string} relativePath
 * @returns {boolean}
 */
function isSecretPath(relativePath) {
  const posix = toPosix(relativePath);
  const base = posix.split("/").pop() ?? posix;

  if (ALLOWED_ENV_EXAMPLES.has(base)) {
    return false;
  }

  return SECRET_BASENAME_PATTERNS.some((pattern) => pattern.test(base));
}

const staged = getStagedFiles();
const secrets = staged.filter(isSecretPath);

if (secrets.length > 0) {
  fail(
    [
      "Blocked staged secret-like files:",
      ...secrets.map((file) => `  - ${file}`),
      "",
      "Remove them from the index (git restore --staged <file>) and keep secrets out of git."
    ].join("\n")
  );
}

console.log("check-secrets: ok");

const { cpSync, existsSync, mkdirSync } = require("node:fs");
const path = require("node:path");

function copyDirectory(source, destination) {
  if (!existsSync(source)) {
    throw new Error(
      `[standalone] Required asset directory is missing: ${source}`
    );
  }

  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true, force: true });
}

function prepareStandaloneAssets(
  rootDirectory = path.resolve(__dirname, "..")
) {
  const repositoryRoot = path.resolve(rootDirectory);
  const buildDirectory = path.join(repositoryRoot, ".next-app");
  const standaloneDirectory = path.join(buildDirectory, "standalone");

  copyDirectory(
    path.join(buildDirectory, "static"),
    path.join(standaloneDirectory, ".next-app", "static")
  );
  copyDirectory(
    path.join(repositoryRoot, "public"),
    path.join(standaloneDirectory, "public")
  );

  console.log("[standalone] Copied Next.js static and public assets.");
}

if (require.main === module) {
  prepareStandaloneAssets();
}

module.exports = { prepareStandaloneAssets };

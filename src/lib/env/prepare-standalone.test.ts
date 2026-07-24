import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { prepareStandaloneAssets } = require(
  path.resolve(process.cwd(), "scripts/prepare-standalone.cjs")
) as {
  prepareStandaloneAssets: (rootDirectory: string) => void;
};

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("standalone asset preparation", () => {
  it("copies generated static files and public assets beside the standalone server", () => {
    const rootDirectory = mkdtempSync(
      path.join(tmpdir(), "costapulse-standalone-")
    );
    temporaryDirectories.push(rootDirectory);

    mkdirSync(path.join(rootDirectory, ".next-app", "static", "css"), {
      recursive: true
    });
    mkdirSync(path.join(rootDirectory, "public", "illustrations"), {
      recursive: true
    });
    writeFileSync(
      path.join(rootDirectory, ".next-app", "static", "css", "app.css"),
      ".hero { color: white; }"
    );
    writeFileSync(
      path.join(rootDirectory, "public", "illustrations", "hero.svg"),
      "<svg />"
    );

    prepareStandaloneAssets(rootDirectory);

    expect(
      readFileSync(
        path.join(
          rootDirectory,
          ".next-app",
          "standalone",
          ".next-app",
          "static",
          "css",
          "app.css"
        ),
        "utf8"
      )
    ).toContain(".hero");
    expect(
      readFileSync(
        path.join(
          rootDirectory,
          ".next-app",
          "standalone",
          "public",
          "illustrations",
          "hero.svg"
        ),
        "utf8"
      )
    ).toBe("<svg />");
  });
});

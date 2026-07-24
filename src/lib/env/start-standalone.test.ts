import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import packageJson from "../../../package.json";

const require = createRequire(import.meta.url);
const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const wrapperPath = path.resolve(currentDir, "../../../start-standalone.cjs");

type StartWrapperModule = {
  prepareStandaloneServerEnv?: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv;
};

function loadStartWrapper(): StartWrapperModule | null {
  try {
    return require(wrapperPath) as StartWrapperModule;
  } catch {
    return null;
  }
}

describe("standalone startup wrapper", () => {
  it("is used by the production start script", () => {
    expect(packageJson.scripts.start).toBe("node start-standalone.cjs");
  });

  it("forces a Railway-safe hostname while preserving the assigned port", () => {
    const wrapper = loadStartWrapper();

    expect(wrapper).not.toBeNull();
    expect(typeof wrapper?.prepareStandaloneServerEnv).toBe("function");

    const env = wrapper?.prepareStandaloneServerEnv?.({
      HOSTNAME: "builder-zkhqzj",
      PORT: "8080",
      NODE_ENV: "production"
    });

    expect(env).toMatchObject({
      HOSTNAME: "0.0.0.0",
      PORT: "8080",
      NODE_ENV: "production"
    });
  });
});

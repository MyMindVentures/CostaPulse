import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    files: ["start-standalone.cjs", "scripts/prepare-standalone.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  {
    files: ["**/*.test.tsx"],
    rules: {
      "@next/next/no-img-element": "off"
    }
  },
  globalIgnores([
    ".next/**",
    ".next-app/**",
    "out/**",
    "coverage/**",
    "playwright-report/**"
  ])
]);

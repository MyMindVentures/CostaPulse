import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const presentationalNoBackendImports = {
  "no-restricted-imports": [
    "error",
    {
      paths: [
        {
          name: "@supabase/supabase-js",
          message:
            "Presentational UI must not import Supabase. Fetch in repositories and pass view models."
        },
        {
          name: "@supabase/ssr",
          message:
            "Presentational UI must not import Supabase SSR clients. Fetch in repositories and pass view models."
        },
        {
          name: "server-only",
          message:
            "Presentational UI must stay client-safe. Keep server-only modules in src/server or src/lib server boundaries."
        }
      ],
      patterns: [
        {
          group: ["@/lib/supabase", "@/lib/supabase/*"],
          message:
            "Presentational UI must not import Supabase clients. Use repositories → view models."
        },
        {
          group: ["@/server", "@/server/*"],
          message:
            "Presentational UI must not import server modules. Pass serializable view models from Server Components."
        },
        {
          group: ["@/types/database", "@/types/database/*"],
          message:
            "Do not use raw database row types in presentational UI. Map to view models at the repository boundary."
        },
        {
          group: ["**/*.test", "**/*.test.*", "**/*.spec", "**/*.spec.*"],
          message:
            "Production UI must not import test modules. Keep fixtures in test files only."
        },
        {
          group: [
            "**/fixtures",
            "**/fixtures/*",
            "**/__fixtures__",
            "**/__fixtures__/*",
            "**/mocks",
            "**/mocks/*",
            "**/__mocks__",
            "**/__mocks__/*"
          ],
          message:
            "Production UI must not import fixtures or mocks. Use real view models from repositories."
        }
      ]
    }
  ]
};

const productionNoTestImports = {
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: ["**/*.test", "**/*.test.*", "**/*.spec", "**/*.spec.*"],
          message:
            "Production modules must not import test files. Keep fixtures in test code only."
        },
        {
          group: [
            "**/fixtures",
            "**/fixtures/*",
            "**/__fixtures__",
            "**/__fixtures__/*",
            "**/mocks",
            "**/mocks/*",
            "**/__mocks__",
            "**/__mocks__/*"
          ],
          message:
            "Production modules must not import fixtures or mocks. Use real backend contracts."
        }
      ]
    }
  ]
};

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ]
    }
  },
  {
    files: [
      "src/components/**/*.{ts,tsx}",
      "src/features/**/components/**/*.{ts,tsx}",
      "src/features/**/detail/**/*.{ts,tsx}",
      "src/features/**/preview/**/*.{ts,tsx}",
      "src/features/**/steps/**/*.{ts,tsx}"
    ],
    ignores: [
      "src/components/**/*.test.{ts,tsx}",
      "src/features/**/*.test.{ts,tsx}"
    ],
    rules: presentationalNoBackendImports
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/**/*.test.{ts,tsx}",
      "src/**/*.spec.{ts,tsx}",
      "src/**/*.stories.{ts,tsx}"
    ],
    rules: productionNoTestImports
  },
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
    "playwright-report/**",
    "storybook-static/**",
    "test-results/**"
  ])
]);

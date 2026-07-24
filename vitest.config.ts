import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  test: {
    environment: "jsdom",
    pool: "threads",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/server/bookings/pricing.ts",
        "src/server/bookings/schema.ts",
        "src/lib/view-models/**/*.ts",
        "src/lib/url/**/*.ts",
        "src/lib/pricing/**/*.ts"
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.stories.tsx",
        "src/server/bookings/checkout.ts",
        "src/server/bookings/service.ts"
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70
      }
    },
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["tests/e2e/**"]
  }
});

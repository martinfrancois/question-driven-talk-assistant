import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: [],
    include: ["**/*.property.spec.ts"],
    browser: {
      enabled: false,
    },
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      include: ["src/lib/**/*.ts"],
      exclude: [
        "src/**/*.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/*.property.spec.ts",
        "src/lib/utils.ts",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 95,
        statements: 97,
      },
    },
  },
});

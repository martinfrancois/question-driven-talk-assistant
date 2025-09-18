import { defineConfig } from "vitest/config";

export const coverageExcludesCommon = [
  "**/*.spec.ts",
  "**/*.spec.tsx",
  "**/*.property.spec.ts",
  "**/playwright-report/**",
  "**/test-results/**",
  "**/coverage/**",
  "**/*.config.js",
  "**/*.config.ts",
  "**/setup-vitest.ts",
  "**/e2e/**",
  "**/dist/**",
  "src/__mocks__/**",
];

export const sharedVitestConfig = defineConfig({
  test: {
    setupFiles: ["./setup-vitest.ts"],
    browser: {
      enabled: true,
      headless: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
    },
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      exclude: [...coverageExcludesCommon],
    },
  },
});

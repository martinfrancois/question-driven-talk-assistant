import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    setupFiles: ["./setup-vitest.ts"],
    include: ["**/*.property.spec.ts"],
    browser: {
      enabled: true,
      headless: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
    },
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/*.property.spec.ts",
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
      ],
      thresholds: {
        statements: 99,
        branches: 91,
        functions: 100,
        lines: 99,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

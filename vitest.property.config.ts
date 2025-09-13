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
        "src/__mocks__/**",
      ],
      thresholds: {
        lines: 99,
        functions: 100,
        branches: 92,
        statements: 99,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

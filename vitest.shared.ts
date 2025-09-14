import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

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
  "__mocks__/**",
  // Test code, not shipped application code.
  "src/test-utils/**",
  "src/vite-env.d.ts",
];

export const sharedVitestConfig = defineConfig({
  resolve: {
    alias: [
      // Match only the root entry point, leaving the real subpath exports intact.
      {
        find: /^zustand$/,
        replacement: fileURLToPath(
          new URL("./__mocks__/zustand.ts", import.meta.url),
        ),
      },
    ],
  },
  test: {
    setupFiles: ["./setup-vitest.ts"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      exclude: [...coverageExcludesCommon],
    },
  },
});

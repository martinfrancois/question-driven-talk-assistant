import { configDefaults, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, {
  test: {
    setupFiles: ["./setup-vitest.ts"],
    browser: {
      enabled: true,
      headless: true,
      instances: [
        {
          browser: "chromium",
        },
      ],
      provider: "playwright",
    },
    exclude: [...configDefaults.exclude, "e2e/*"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      exclude: [
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
      ],
      thresholds: {
        statements: 61,
        branches: 64,
        functions: 59,
        lines: 59,
      },
    },
  },
});

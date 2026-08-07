import { configDefaults, defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import viteConfig from "./vite.config";

export default defineConfig({
  ...viteConfig,
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
      provider: playwright(),
    },
    exclude: [...configDefaults.exclude, "e2e/*"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      // Without an explicit include, only files that a test happens to import
      // are counted, which silently hides every untested file from the report.
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        // Test code, not shipped application code.
        "src/**/*.spec.{ts,tsx}",
        "src/test-utils/**",
        "src/vite-env.d.ts",
      ],
      thresholds: {
        lines: 80,
      },
    },
  },
});

import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig, mergeConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
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
  }),
);

import { configDefaults, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";
import { sharedVitestConfig } from "./vitest.shared.ts";

export default mergeConfig(
  viteConfig,
  mergeConfig(sharedVitestConfig, {
    test: {
      // Exclude property-based tests from the default/unit run
      exclude: [...configDefaults.exclude, "e2e/*", "**/*.property.spec.ts"],
      coverage: {
        // Without an explicit include, only files that a test happens to import
        // are counted, which silently hides every untested file from the report.
        include: ["src/**/*.{ts,tsx}"],
        thresholds: {
          lines: 80,
        },
      },
    },
  }),
);

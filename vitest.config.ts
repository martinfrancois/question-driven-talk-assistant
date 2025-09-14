import { configDefaults, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";
import { sharedVitestConfig } from "./vitest.shared";

export default mergeConfig(
  viteConfig,
  mergeConfig(sharedVitestConfig, {
    test: {
      // Exclude property-based tests from the default/unit run
      exclude: [...configDefaults.exclude, "e2e/*", "**/*.property.spec.ts"],
      coverage: {
        thresholds: {
          statements: 61,
          branches: 64,
          functions: 59,
          lines: 59,
        },
      },
    },
  }),
);

import { mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";
import { coverageExcludesCommon, sharedVitestConfig } from "./vitest.shared";

export default mergeConfig(
  viteConfig,
  mergeConfig(sharedVitestConfig, {
    test: {
      include: ["**/*.property.spec.ts"],
      coverage: {
        include: ["src/**/*.ts"],
        exclude: [...coverageExcludesCommon, "src/**/*.tsx"],
        thresholds: {
          statements: 99,
          branches: 91,
          functions: 100,
          lines: 99,
        },
      },
    },
  }),
);

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
    },
  },
});

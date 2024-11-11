import { configDefaults, defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default defineConfig({
  ...viteConfig,
  test: {
    browser: {
      enabled: true,
      name: "chromium",
      provider: "playwright",
      // workaround for https://youtrack.jetbrains.com/issue/WEB-68768/Vitest-Browser-Mode-Debugging-Doesnt-Work
      providerOptions: {
        launch: {
          args: ["--remote-debugging-port=9222"],
        },
      },
    },
    exclude: [...configDefaults.exclude, "e2e/*"],
  },
});

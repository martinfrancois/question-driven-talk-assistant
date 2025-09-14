import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";

const useDarkMode = vi.fn<[], boolean>(() => true);
vi.mock("@/stores", () => ({ useDarkMode }));

describe("useDarkModeClassName (property)", () => {
  it("maps arbitrary boolean to expected class name", async () => {
    const { useDarkModeClassName } = await import("./dark-mode-classnames.ts");
    const { useDarkMode } = await import("@/stores");

    fc.assert(
      fc.property(fc.boolean(), (isDark: boolean) => {
        vi.mocked(useDarkMode).mockReturnValue(isDark);
        const cls = useDarkModeClassName();
        expect(cls).toBe(isDark ? "dark" : "light");
      }),
    );
  });
});

import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";

vi.mock("@/stores", () => {
  const useDarkMode = vi.fn(() => true);
  return { useDarkMode };
});

describe("useDarkModeClassName (property)", () => {
  it("maps arbitrary boolean to expected class name", async () => {
    const Stores = await import("@/stores");
    const { useDarkModeClassName } = await import("./dark-mode-classnames.ts");

    fc.assert(
      fc.property(fc.boolean(), (isDark) => {
        const mockedStores = vi.mocked(Stores);
        mockedStores.useDarkMode.mockReturnValue(isDark);
        const cls = useDarkModeClassName();
        expect(cls).toBe(isDark ? "dark" : "light");
      }),
    );
  });
});

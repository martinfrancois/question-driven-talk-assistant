import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";

vi.mock("@/stores", () => {
  return { useDarkMode: vi.fn(() => true) };
});

describe("useDarkModeClassName (property)", () => {
  it("maps arbitrary boolean to expected class name", async () => {
    const Stores = await import("@/stores");
    const { useDarkModeClassName } = await import("./dark-mode-classnames.ts");

    fc.assert(
      fc.property(fc.boolean(), (isDark) => {
        (
          Stores.useDarkMode as unknown as {
            mockReturnValue: (v: boolean) => void;
          }
        ).mockReturnValue(isDark);
        const cls = useDarkModeClassName();
        expect(cls).toBe(isDark ? "dark" : "light");
      }),
    );
  });
});

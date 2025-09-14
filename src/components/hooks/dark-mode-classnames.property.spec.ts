import { describe, it, expect, vi, type Mock } from "vitest";
import * as fc from "fast-check";

vi.mock("@/stores", () => {
  return { useDarkMode: vi.fn(() => true) };
});

describe("useDarkModeClassName (property)", () => {
  it("maps arbitrary boolean to expected class name", async () => {
    const Stores = await import("@/stores");
    const { useDarkModeClassName } = await import("./dark-mode-classnames.ts");

    fc.assert(
      fc.property(fc.boolean(), (isDark) => {
        (Stores.useDarkMode as Mock<() => boolean>).mockReturnValue(isDark);
        const cls = useDarkModeClassName();
        expect(cls).toBe(isDark ? "dark" : "light");
      }),
    );
  });
});

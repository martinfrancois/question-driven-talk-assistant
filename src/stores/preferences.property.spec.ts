import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { renderHook, act } from "@testing-library/react";

vi.mock("zustand/middleware", async () => {
  const actual =
    await vi.importActual<typeof import("zustand/middleware")>(
      "zustand/middleware",
    );
  return {
    ...actual,
    persist: ((fn: unknown) => fn) as typeof actual.persist,
    devtools: ((fn: unknown) => fn) as typeof actual.devtools,
  } satisfies typeof import("zustand/middleware");
});

describe("preferences store (properties)", () => {
  it("increase/decrease font size respects lower bound and step", async () => {
    const { useFontSize, useIncreaseFontSize, useDecreaseFontSize } =
      await import("./preferences.ts");
    const { result } = renderHook(() => {
      const font = useFontSize();
      const inc = useIncreaseFontSize();
      const dec = useDecreaseFontSize();
      return { font, inc, dec };
    });

    fc.assert(
      fc.property(fc.integer({ min: 0, max: 50 }), (steps) => {
        act(() => {
          for (let i = 0; i < steps; i++) result.current.inc();
        });
        const afterInc = result.current.font;
        act(() => {
          for (let i = 0; i < steps * 2; i++) result.current.dec();
        });
        const afterDec = result.current.font;
        expect(afterDec).toBeGreaterThanOrEqual(12);
        expect(afterInc).toBeGreaterThanOrEqual(afterDec);
      }),
    );
  });

  it("toggles flip booleans", async () => {
    const {
      useDarkMode,
      useToggleDarkMode,
      useTimeFormat24h,
      useToggleTimeFormat,
    } = await import("./preferences.ts");
    const { result } = renderHook(() => {
      const dark = useDarkMode();
      const toggleDark = useToggleDarkMode();
      const t24 = useTimeFormat24h();
      const toggle24 = useToggleTimeFormat();
      return { dark, toggleDark, t24, toggle24 };
    });

    const d0 = result.current.dark;
    act(() => result.current.toggleDark());
    expect(result.current.dark).toBe(!d0);

    const t0 = result.current.t24;
    act(() => result.current.toggle24());
    expect(result.current.t24).toBe(!t0);
  });
});

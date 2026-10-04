import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { renderHook, act } from "@testing-library/react";

const MIN_FONT_SIZE = 12;
const FONT_SIZE_STEP = 2;

describe("preferences store (properties)", () => {
  it("any sequence of font size changes steps by 2 and never drops below 12", async () => {
    const { useFontSize, useIncreaseFontSize, useDecreaseFontSize } =
      await import("./preferences.ts");

    fc.assert(
      fc.property(fc.array(fc.boolean(), { maxLength: 60 }), (increases) => {
        const { result, unmount } = renderHook(() => ({
          font: useFontSize(),
          inc: useIncreaseFontSize(),
          dec: useDecreaseFontSize(),
        }));

        // The store outlives a single run, so the model starts where it is.
        let expected = result.current.font;
        for (const increase of increases) {
          act(() => (increase ? result.current.inc() : result.current.dec()));
          expected = increase
            ? expected + FONT_SIZE_STEP
            : Math.max(MIN_FONT_SIZE, expected - FONT_SIZE_STEP);
          expect(result.current.font).toBe(expected);
        }
        unmount();
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

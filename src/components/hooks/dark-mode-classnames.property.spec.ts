import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { renderHook, act } from "@testing-library/react";
import { useDarkMode, useToggleDarkMode } from "@/stores";
import { useDarkModeClassName } from "./dark-mode-classnames.ts";

describe("useDarkModeClassName (property)", () => {
  it("follows the dark mode flag through any sequence of toggles", () => {
    fc.assert(
      fc.property(fc.nat({ max: 20 }), (toggles) => {
        const { result, unmount } = renderHook(() => ({
          className: useDarkModeClassName(),
          darkMode: useDarkMode(),
          toggle: useToggleDarkMode(),
        }));

        for (let i = 0; i < toggles; i++) {
          act(() => result.current.toggle());
          expect(result.current.className).toBe(
            result.current.darkMode ? "dark" : "light",
          );
        }
        unmount();
      }),
    );
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDarkModeClassName } from "./dark-mode-classnames.ts";
import { StorageName, useDarkMode, useToggleDarkMode } from "@/stores";

/**
 * Drives the real hook against the real preferences store; nothing is stubbed.
 */
describe("useDarkModeClassName", () => {
  beforeEach(() => {
    localStorage.removeItem(StorageName.PREFERENCES);
  });

  const renderDarkMode = () => {
    const rendered = renderHook(() => ({
      className: useDarkModeClassName(),
      darkMode: useDarkMode(),
      toggleDarkMode: useToggleDarkMode(),
    }));
    // The store is shared across this file, so start from a known light state.
    if (rendered.result.current.darkMode) {
      act(() => {
        rendered.result.current.toggleDarkMode();
      });
    }
    return rendered;
  };

  it("returns 'light' while dark mode is off", () => {
    const { result } = renderDarkMode();

    expect(result.current.className).toBe("light");
  });

  it("returns 'dark' once dark mode is switched on", () => {
    const { result } = renderDarkMode();

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.className).toBe("dark");
  });

  it("returns to 'light' when dark mode is switched off again", () => {
    const { result } = renderDarkMode();

    act(() => {
      result.current.toggleDarkMode();
    });
    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.className).toBe("light");
  });
});

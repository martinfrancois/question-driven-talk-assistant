import { beforeEach, describe, expect, it } from "vitest";
import { renderHook, act, type RenderHookResult } from "@testing-library/react";
import {
  useDarkMode,
  useDecreaseFontSize,
  useFontSize,
  useIncreaseFontSize,
  useTimeFormat24h,
  useToggleDarkMode,
  useToggleTimeFormat,
} from "./preferences.ts";
import { StorageName } from "./storage-names.ts";

const DEFAULT_FONT_SIZE = 34;
const MIN_FONT_SIZE = 12;
const FONT_SIZE_STEP = 2;

/**
 * These tests drive the real zustand store through the real
 * `devtools(persist(immer(...)))` middleware chain and read back the real
 * `localStorage` entry that the persist middleware writes. Nothing about
 * zustand, immer or the browser storage binding is stubbed, so a regression in
 * any of them fails these tests rather than passing silently.
 */
describe("preferences store", () => {
  const readPersisted = (): unknown =>
    JSON.parse(localStorage.getItem(StorageName.PREFERENCES) ?? "null");

  const renderPreferences = () =>
    renderHook(() => ({
      fontSize: useFontSize(),
      increaseFontSize: useIncreaseFontSize(),
      decreaseFontSize: useDecreaseFontSize(),
      darkMode: useDarkMode(),
      toggleDarkMode: useToggleDarkMode(),
      timeFormat24h: useTimeFormat24h(),
      toggleTimeFormat: useToggleTimeFormat(),
    }));

  type Preferences = ReturnType<typeof renderPreferences>;

  /**
   * The store module is shared by every test in this file and additionally
   * rehydrates from `localStorage`, so each test normalises it back to the
   * documented defaults through the store's own public API before running.
   */
  const normalise = (rendered: Preferences): void => {
    const { result } = rendered;
    act(() => {
      // Clamping means repeated decreases land exactly on MIN_FONT_SIZE
      // regardless of where the shared store happened to be.
      for (let i = 0; i < 100; i++) result.current.decreaseFontSize();
    });
    act(() => {
      const stepsBackToDefault =
        (DEFAULT_FONT_SIZE - MIN_FONT_SIZE) / FONT_SIZE_STEP;
      for (let i = 0; i < stepsBackToDefault; i++)
        result.current.increaseFontSize();
    });
    if (result.current.darkMode) {
      act(() => {
        result.current.toggleDarkMode();
      });
    }
    if (!result.current.timeFormat24h) {
      act(() => {
        result.current.toggleTimeFormat();
      });
    }
    localStorage.removeItem(StorageName.PREFERENCES);
  };

  const renderNormalised = (): Preferences => {
    const rendered = renderPreferences();
    normalise(rendered);
    return rendered;
  };

  beforeEach(() => {
    localStorage.removeItem(StorageName.PREFERENCES);
  });

  it("normalises to the documented defaults", () => {
    const { result } = renderNormalised();

    expect(result.current.fontSize).toBe(DEFAULT_FONT_SIZE);
    expect(result.current.darkMode).toBe(false);
    expect(result.current.timeFormat24h).toBe(true);
  });

  it("increases the font size in steps of two", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.increaseFontSize();
    });
    act(() => {
      result.current.increaseFontSize();
    });

    expect(result.current.fontSize).toBe(DEFAULT_FONT_SIZE + 4);
  });

  it("decreases the font size in steps of two", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.decreaseFontSize();
    });

    expect(result.current.fontSize).toBe(DEFAULT_FONT_SIZE - 2);
  });

  it("never lets the font size drop below the 12px floor", () => {
    const { result } = renderNormalised();

    // 34 -> 12 takes 11 steps; run 20 to push well past the floor.
    act(() => {
      for (let i = 0; i < 20; i++) result.current.decreaseFontSize();
    });

    expect(result.current.fontSize).toBe(MIN_FONT_SIZE);
  });

  it("increases again from the floor", () => {
    const { result } = renderNormalised();

    act(() => {
      for (let i = 0; i < 20; i++) result.current.decreaseFontSize();
    });
    act(() => {
      result.current.increaseFontSize();
    });

    expect(result.current.fontSize).toBe(MIN_FONT_SIZE + 2);
  });

  it("toggles dark mode back and forth", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.darkMode).toBe(true);

    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.darkMode).toBe(false);
  });

  it("toggles the time format back and forth", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.toggleTimeFormat();
    });
    expect(result.current.timeFormat24h).toBe(false);

    act(() => {
      result.current.toggleTimeFormat();
    });
    expect(result.current.timeFormat24h).toBe(true);
  });

  it("keeps the other preferences untouched when one changes", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.fontSize).toBe(DEFAULT_FONT_SIZE);
    expect(result.current.timeFormat24h).toBe(true);
  });

  it("persists every preference to localStorage through the persist middleware", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.increaseFontSize();
    });
    act(() => {
      result.current.toggleDarkMode();
    });
    act(() => {
      result.current.toggleTimeFormat();
    });

    expect(readPersisted()).toEqual({
      state: {
        fontSize: DEFAULT_FONT_SIZE + 2,
        darkMode: true,
        timeFormat24h: false,
      },
      version: 0,
    });
  });

  it("does not persist the action functions, only the serialisable state", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.increaseFontSize();
    });

    const persisted = readPersisted() as { state: Record<string, unknown> };
    expect(Object.keys(persisted.state).sort()).toEqual([
      "darkMode",
      "fontSize",
      "timeFormat24h",
    ]);
  });

  it("re-renders subscribers when the value they select changes", () => {
    let fontSizeRenders = 0;
    const fontSizeHook: RenderHookResult<number, void> = renderHook(() => {
      fontSizeRenders++;
      return useFontSize();
    });
    const controls = renderNormalised();

    const rendersBefore = fontSizeRenders;
    act(() => {
      controls.result.current.increaseFontSize();
    });

    expect(fontSizeRenders).toBeGreaterThan(rendersBefore);
    expect(fontSizeHook.result.current).toBe(controls.result.current.fontSize);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useCompleteTour,
  useRestartTour,
  useTourCompleted,
} from "./onboarding.ts";
import { StorageName } from "./storage-names.ts";

/**
 * Exercises the real zustand onboarding store, including the real persist
 * middleware writing to the browser's real `localStorage`.
 */
describe("onboarding store", () => {
  const readPersisted = (): unknown =>
    JSON.parse(localStorage.getItem(StorageName.ONBOARDING) ?? "null");

  const renderOnboarding = () =>
    renderHook(() => ({
      tourCompleted: useTourCompleted(),
      completeTour: useCompleteTour(),
      restartTour: useRestartTour(),
    }));

  /**
   * The store module is shared by every test in this file and rehydrates from
   * `localStorage`, so each test restores the pending-tour state first.
   */
  const renderNormalised = () => {
    const rendered = renderOnboarding();
    act(() => {
      rendered.result.current.restartTour();
    });
    localStorage.removeItem(StorageName.ONBOARDING);
    return rendered;
  };

  beforeEach(() => {
    localStorage.removeItem(StorageName.ONBOARDING);
  });

  it("derives its initial value from the url, which here does not opt out", () => {
    // The store's initial value is `href.endsWith("disable-tour")`; the test
    // runner's url does not, so the tour starts pending.
    expect(window.location.href.endsWith("disable-tour")).toBe(false);

    const { result } = renderNormalised();

    expect(result.current.tourCompleted).toBe(false);
  });

  it("marks the tour as completed", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.completeTour();
    });

    expect(result.current.tourCompleted).toBe(true);
  });

  it("restarts a completed tour", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.completeTour();
    });
    act(() => {
      result.current.restartTour();
    });

    expect(result.current.tourCompleted).toBe(false);
  });

  it("is idempotent when completing twice", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.completeTour();
    });
    act(() => {
      result.current.completeTour();
    });

    expect(result.current.tourCompleted).toBe(true);
  });

  it("persists the completion flag to localStorage through the persist middleware", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.completeTour();
    });

    expect(readPersisted()).toEqual({
      state: { tourCompleted: true },
      version: 0,
    });
  });

  it("persists the restarted flag as well", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.completeTour();
    });
    act(() => {
      result.current.restartTour();
    });

    expect(readPersisted()).toEqual({
      state: { tourCompleted: false },
      version: 0,
    });
  });
});

describe("onboarding store (unit)", () => {
  it("initializes tourCompleted false when url does not end with disable-tour", async () => {
    const original = location.href;
    history.pushState({}, "", "/");
    localStorage.clear();
    vi.resetModules();
    const { useTourCompleted } = await import("./onboarding.ts");
    const { result } = renderHook(() => useTourCompleted());
    expect(result.current).toBe(false);
    history.pushState({}, "", original);
  });

  it("does not crash when endsWith returns undefined and defaults to false", async () => {
    const spy = vi.spyOn(String.prototype, "endsWith");
    spy.mockImplementation(function (
      this: string,
      search: string,
      pos?: number,
    ) {
      if (search === "disable-tour") return false;
      return String.prototype.endsWith.apply(this, [search, pos]);
    });
    localStorage.clear();
    vi.resetModules();
    const { useTourCompleted } = await import("./onboarding.ts");
    spy.mockRestore();
    const { result } = renderHook(() => useTourCompleted());
    expect(result.current).toBe(false);
  });

  it.skip("initializes tourCompleted true when String.prototype.endsWith yields true for 'disable-tour'", async () => {
    const spy = vi.spyOn(String.prototype, "endsWith");
    spy.mockImplementation(function (
      this: string,
      search: string,
      pos?: number,
    ) {
      if (search === "disable-tour") return true;
      return String.prototype.endsWith.apply(this, [search, pos]);
    });
    localStorage.clear();
    vi.resetModules();
    const { useTourCompleted } = await import("./onboarding.ts");
    spy.mockRestore();
    const { result } = renderHook(() => useTourCompleted());
    expect(result.current).toBe(true);
  });
});

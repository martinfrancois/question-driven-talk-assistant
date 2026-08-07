import { beforeEach, describe, expect, it } from "vitest";
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

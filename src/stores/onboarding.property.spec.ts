import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("zustand/middleware", async () => {
  const actual = await vi.importActual<any>("zustand/middleware");
  return { ...actual, persist: (fn: any) => fn, devtools: (fn: any) => fn };
});

describe("onboarding store (properties)", () => {
  it("toggles via actions", async () => {
    const { useTourCompleted, useCompleteTour, useRestartTour } = await import(
      "./onboarding.ts"
    );

    const { result: r1 } = renderHook(() => ({
      completed: useTourCompleted(),
      complete: useCompleteTour(),
      restart: useRestartTour(),
    }));
    const initial = r1.current.completed;
    act(() => r1.current.complete());
    expect(r1.current.completed).toBe(true);
    act(() => r1.current.restart());
    expect(r1.current.completed).toBe(false);
    act(() => (initial ? r1.current.complete() : r1.current.restart()));
  });

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
});

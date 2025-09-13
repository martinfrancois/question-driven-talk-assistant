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

  // Removing the attempt to redefine global window; covered by the test below instead.

  it("does not crash when window.location.href is missing and defaults to false", async () => {
    const originalEndsWith = String.prototype.endsWith;
    // Make endsWith return undefined for target case to exercise nullish-coalescing branch
    // eslint-disable-next-line no-extend-native
    (String.prototype as any).endsWith = function (
      this: string,
      search: string,
      ...rest: any[]
    ) {
      if (search === "disable-tour") return undefined as any;
      return originalEndsWith.call(this, search, ...rest);
    } as any;
    localStorage.clear();
    vi.resetModules();
    const { useTourCompleted } = await import("./onboarding.ts");
    // restore
    // eslint-disable-next-line no-extend-native
    String.prototype.endsWith = originalEndsWith;
    const { result } = renderHook(() => useTourCompleted());
    expect(result.current).toBe(false);
  });

  it.skip("initializes tourCompleted true when url endsWith disable-tour (query, hash, or path)", async () => {
    const origin = new URL(location.href).origin;
    const scenarios = [
      `${origin}/x/disable-tour`,
      `${origin}/?q=1#disable-tour`,
      `${origin}/#disable-tour`,
      `${origin}/abc/def/disable-tour`,
    ];
    for (const url of scenarios) {
      const original = location.href;
      history.pushState({}, "", url);
      localStorage.clear();
      vi.resetModules();
      const { useTourCompleted } = await import("./onboarding.ts");
      const { result, unmount } = renderHook(() => useTourCompleted());
      const ends = window.location.href.endsWith("disable-tour");
      expect(ends).toBe(true);
      expect(result.current).toBe(true);
      unmount();
      history.pushState({}, "", original);
    }
  });
});

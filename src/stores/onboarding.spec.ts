import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("zustand/middleware", async () => {
  const actual =
    await vi.importActual<typeof import("zustand/middleware")>(
      "zustand/middleware",
    );
  return {
    ...actual,
    persist: <T>(fn: T) => fn,
    devtools: <T>(fn: T) => fn,
  } satisfies typeof import("zustand/middleware");
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
      ...rest: unknown[]
    ) {
      if (search === "disable-tour") return undefined as unknown as boolean;
      return String.prototype.endsWith.apply(this, [search, ...rest]);
    });
    localStorage.clear();
    vi.resetModules();
    const { useTourCompleted } = await import("./onboarding.ts");
    spy.mockRestore();
    const { result } = renderHook(() => useTourCompleted());
    expect(result.current).toBe(false);
  });

  it("initializes tourCompleted true when String.prototype.endsWith yields true for 'disable-tour'", async () => {
    const spy = vi.spyOn(String.prototype, "endsWith");
    spy.mockImplementation(function (
      this: string,
      search: string,
      ...rest: unknown[]
    ) {
      if (search === "disable-tour") return true;
      return String.prototype.endsWith.apply(this, [search, ...rest]);
    });
    localStorage.clear();
    vi.resetModules();
    const { useTourCompleted } = await import("./onboarding.ts");
    spy.mockRestore();
    const { result } = renderHook(() => useTourCompleted());
    expect(result.current).toBe(true);
  });
});

import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("zustand/middleware", async () => {
  const actual = await vi.importActual<any>("zustand/middleware");
  return { ...actual, persist: (fn: any) => fn, devtools: (fn: any) => fn };
});

describe("onboarding store (properties) - true branch", () => {
  it("initializes tourCompleted true when String.prototype.endsWith yields true for 'disable-tour'", async () => {
    const originalEndsWith = String.prototype.endsWith;
    // eslint-disable-next-line no-extend-native
    (String.prototype as any).endsWith = function (
      this: string,
      search: string,
      ...rest: any[]
    ) {
      if (search === "disable-tour") return true;
      return originalEndsWith.call(this, search, ...rest);
    } as any;
    localStorage.clear();
    vi.resetModules();
    const { useTourCompleted } = await import("./onboarding.ts");
    // restore immediately to avoid leaking the override
    // eslint-disable-next-line no-extend-native
    String.prototype.endsWith = originalEndsWith;
    const { result } = renderHook(() => useTourCompleted());
    expect(result.current).toBe(true);
  });
});

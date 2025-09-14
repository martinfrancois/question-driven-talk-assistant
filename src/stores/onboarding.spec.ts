import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

type EndsWith = (
  this: string,
  search: string,
  length?: number,
) => boolean | undefined;

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
    const originalEndsWith = String.prototype.endsWith.bind(String.prototype);
    (String.prototype as unknown as { endsWith: EndsWith }).endsWith =
      function (this: string, search: string, length?: number) {
        if (search === "disable-tour") return undefined;
        return originalEndsWith.call(this, search, length);
      };
    localStorage.clear();
    vi.resetModules();
    const { useTourCompleted } = await import("./onboarding.ts");
    // restore
    String.prototype.endsWith = originalEndsWith;
    const { result } = renderHook(() => useTourCompleted());
    expect(result.current).toBe(false);
  });

  it("initializes tourCompleted true when String.prototype.endsWith yields true for 'disable-tour'", async () => {
    const originalEndsWith = String.prototype.endsWith.bind(String.prototype);
    (String.prototype as unknown as { endsWith: EndsWith }).endsWith =
      function (this: string, search: string, length?: number) {
        if (search === "disable-tour") return true;
        return originalEndsWith.call(this, search, length);
      };
    localStorage.clear();
    vi.resetModules();
    const { useTourCompleted } = await import("./onboarding.ts");
    // restore immediately to avoid leaking the override
    String.prototype.endsWith = originalEndsWith;
    const { result } = renderHook(() => useTourCompleted());
    expect(result.current).toBe(true);
  });
});

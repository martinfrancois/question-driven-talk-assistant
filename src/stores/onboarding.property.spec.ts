import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import fc from "fast-check";

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

describe("onboarding store (property)", () => {
  it("final state equals last action in any sequence of complete/restart", async () => {
    const { useTourCompleted, useCompleteTour, useRestartTour } = await import(
      "./onboarding.ts"
    );

    fc.assert(
      fc.property(fc.array(fc.boolean(), { maxLength: 50 }), (actions) => {
        const { result } = renderHook(() => ({
          completed: useTourCompleted(),
          complete: useCompleteTour(),
          restart: useRestartTour(),
        }));

        const initial = result.current.completed;

        for (const a of actions) {
          act(() => {
            if (a) result.current.complete();
            else result.current.restart();
          });
        }

        const expected =
          actions.length === 0 ? initial : actions[actions.length - 1];
        expect(result.current.completed).toBe(expected);
      }),
    );
  });
});

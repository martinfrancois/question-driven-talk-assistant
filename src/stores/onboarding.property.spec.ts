import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as fc from "fast-check";

describe("onboarding store (property)", () => {
  it("final state equals last action in any sequence of complete/restart", async () => {
    const { useTourCompleted, useCompleteTour, useRestartTour } = await import(
      "./onboarding.ts"
    );

    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { maxLength: 50 }),
        (actions: boolean[]) => {
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
        },
      ),
    );
  });
});

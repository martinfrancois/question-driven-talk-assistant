import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import fc from "fast-check";
import {
  useTourCompleted,
  useCompleteTour,
  useRestartTour,
} from "./onboarding.ts";

describe("onboarding store (property)", () => {
  it("final state equals last action in any sequence of complete/restart", () => {
    fc.assert(
      fc.property(fc.array(fc.boolean(), { maxLength: 50 }), (actions) => {
        const { result, unmount } = renderHook(() => ({
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
        unmount();
      }),
    );
  });
});

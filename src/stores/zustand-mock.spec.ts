import { describe, expect, it } from "vitest";
import { create } from "zustand";

/**
 * Guards the wiring that isolates store state between tests.
 *
 * `setup-vitest.ts` calls `vi.mock("zustand")`, which only picks up the manual
 * mock in `__mocks__/zustand.ts` when that folder sits at the project root:
 * for `node_modules` packages vitest resolves `__mocks__` relative to the root,
 * never relative to `src/`. If the folder is moved, vitest silently falls back
 * to auto-mocking, the mock's `afterEach` reset never registers, and every
 * store carries its state into the following test.
 *
 * These tests deliberately run in order: the second one mutates a store and the
 * third one asserts the mock reset it.
 */

interface CounterState {
  count: number;
  increment: () => void;
}

const useCounterStore = create<CounterState>()((set) => ({
  count: 0,
  increment: () => {
    set((state) => ({ count: state.count + 1 }));
  },
}));

describe("zustand manual mock", () => {
  it("starts from the store's initial state", () => {
    expect(useCounterStore.getState().count).toBe(0);
  });

  it("keeps a mutation visible within the test that made it", () => {
    useCounterStore.getState().increment();
    expect(useCounterStore.getState().count).toBe(1);
  });

  it("resets every store after each test, so the mutation does not leak", () => {
    expect(useCounterStore.getState().count).toBe(0);
  });
});

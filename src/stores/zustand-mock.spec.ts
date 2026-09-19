import { describe, expect, it } from "vitest";
import { create, createStore } from "zustand";

// Run these tests in order through the global setup, without a local mock or
// cleanup hook. A mutation must survive its own test and reset before the next.

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

const stores = [
  { name: "curried create", store: useCounterStore },
  { name: "uncurried create", store: create(() => ({ count: 0 })) },
  {
    name: "curried createStore",
    store: createStore<{ count: number }>()(() => ({ count: 0 })),
  },
  { name: "uncurried createStore", store: createStore(() => ({ count: 0 })) },
];

describe.each(stores)(
  "zustand manual mock: $name",
  { concurrent: false },
  ({ store }) => {
    it("starts from the store's initial state", () => {
      expect(store.getState().count).toBe(0);
    });

    it("keeps a mutation visible within the test that made it", () => {
      store.setState({ count: 1 });
      expect(store.getState().count).toBe(1);
    });

    it("resets every store after each test, so the mutation does not leak", () => {
      expect(store.getState().count).toBe(0);
    });
  },
);

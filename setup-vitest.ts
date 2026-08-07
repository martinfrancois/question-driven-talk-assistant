import { afterAll, beforeAll, vi } from "vitest";

// Loads the manual mock in `__mocks__/zustand.ts`, which wraps zustand's
// `create`/`createStore` so every store registers a reset function that runs
// after each test. For node_modules packages vitest only looks for `__mocks__`
// directly under the project root, so that folder must NOT be moved under
// `src/`. If it is, this call silently falls back to vitest's auto-mock and the
// reset never registers, so store state leaks between tests.
vi.mock("zustand");

// Mocks the textarea's scrollHeight to a fixed value to ensure consistent height calculations
// across different test environments and runs to make snapshot tests deterministic.
beforeAll(() => {
  Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", {
    get() {
      return 20; // Set a consistent height value
    },
    configurable: true,
  });
});

// Makes all properties non-readonly and optional, so they can be deleted from the object
type Deletable<T> = { -readonly [P in keyof T]?: T[P] };

afterAll(() => {
  // Remove the mock to prevent side effects
  delete (HTMLTextAreaElement.prototype as Deletable<HTMLTextAreaElement>)
    .scrollHeight;
});

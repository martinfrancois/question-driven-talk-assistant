import { afterAll, beforeAll, vi } from "vitest";

vi.mock("zustand"); // to make it work like Jest (auto-mocking)

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

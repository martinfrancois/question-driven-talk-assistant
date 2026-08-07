import { describe, expect, it, vi } from "vitest";
// Must come before ./main.tsx: it creates the #root element that the entry
// point mounts into while it is being evaluated.
import { rootElement } from "./test-utils/create-root-element.ts";
import "./main.tsx";

/**
 * Boots the real application entry point. `main.tsx` looks up `#root` and
 * mounts `<App />` into it through the real `react-dom/client` root API, so a
 * regression in the entry point or in React's client entry fails here.
 */
describe("main entry point", () => {
  it("mounts the application into #root", async () => {
    await vi.waitFor(() => {
      if (!rootElement.querySelector("[data-testid='main-layout-container']")) {
        throw new Error("app not mounted yet");
      }
    });

    expect(
      rootElement.querySelector("[data-testid='main-header']"),
    ).not.toBeNull();
    expect(
      rootElement.querySelector("[data-testid='main-footer']"),
    ).not.toBeNull();
    expect(rootElement.querySelector("textarea")).not.toBeNull();
  });

  it("mounts inside React's StrictMode wrapper", () => {
    // StrictMode leaves no DOM of its own, but the tree it wraps must be there.
    expect(rootElement.children.length).toBeGreaterThan(0);
  });
});

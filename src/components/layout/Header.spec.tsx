import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { act } from "@testing-library/react";
import { Header } from "./Header.tsx";
import { StorageName } from "@/stores";
import { pressKey } from "@/test-utils/keyboard.ts";

/**
 * Renders the real `Header` against the real zustand layout store and the real
 * `react-hotkeys-hook`. The only stub is `window.prompt`, a browser dialog that
 * cannot run unattended; every library the component integrates with runs for
 * real.
 */
describe("Header", () => {
  let promptCalls: (string | undefined)[] = [];
  let promptAnswer: string | null = null;

  beforeEach(() => {
    promptCalls = [];
    promptAnswer = null;
    localStorage.removeItem(StorageName.LAYOUT);
    vi.stubGlobal("prompt", (message?: string) => {
      promptCalls.push(message);
      return promptAnswer;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const titleButton = (container: HTMLElement): HTMLButtonElement => {
    const el = container.querySelector<HTMLButtonElement>(
      "[data-testid='main-header']",
    );
    if (!el) throw new Error("title button not rendered");
    return el;
  };

  const clickTitleButton = async (container: HTMLElement): Promise<void> => {
    await act(async () => {
      titleButton(container).click();
      await Promise.resolve();
    });
  };

  /**
   * The layout store is shared by every test in this file, so drive it to a
   * known title through the component's own edit flow first.
   */
  const renderWithTitle = async (title: string): Promise<HTMLElement> => {
    const { container } = await render(<Header />);
    promptAnswer = title;
    await clickTitleButton(container);
    promptCalls = [];
    promptAnswer = null;
    return container;
  };

  it("renders the title held in the store", async () => {
    const container = await renderWithTitle("Ask me anything");

    expect(titleButton(container).textContent).toBe("Ask me anything");
  });

  it("writes the prompt answer back into the store", async () => {
    const container = await renderWithTitle("Old title");

    promptAnswer = "New title";
    await clickTitleButton(container);

    expect(promptCalls).toEqual(["Edit Title"]);
    expect(titleButton(container).textContent).toBe("New title");
  });

  it("keeps the title when the prompt is cancelled", async () => {
    const container = await renderWithTitle("Unchanged");

    promptAnswer = null;
    await clickTitleButton(container);

    expect(promptCalls).toEqual(["Edit Title"]);
    expect(titleButton(container).textContent).toBe("Unchanged");
  });

  it("accepts an empty title from the prompt", async () => {
    const container = await renderWithTitle("Something");

    promptAnswer = "";
    await clickTitleButton(container);

    expect(titleButton(container).textContent).toBe("");
  });

  it("opens the title prompt via the ctrl+shift+t hotkey", async () => {
    const container = await renderWithTitle("Before hotkey");

    promptAnswer = "After hotkey";
    await act(async () => {
      pressKey({ key: "T", code: "KeyT", ctrl: true, shift: true });
      await Promise.resolve();
    });

    expect(promptCalls).toEqual(["Edit Title"]);
    expect(titleButton(container).textContent).toBe("After hotkey");
  });

  it("ignores the hotkey when the shift modifier is missing", async () => {
    await renderWithTitle("Untouched");

    await act(async () => {
      pressKey({ key: "T", code: "KeyT", ctrl: true });
      await Promise.resolve();
    });

    expect(promptCalls).toEqual([]);
  });

  it("describes a filled title for assistive technology", async () => {
    const container = await renderWithTitle("My talk");

    expect(titleButton(container).getAttribute("aria-label")).toBe(
      "Title text: My talk. Click to edit title.",
    );
  });

  it("describes a whitespace-only title as empty for assistive technology", async () => {
    const container = await renderWithTitle("   ");

    expect(titleButton(container).getAttribute("aria-label")).toBe(
      "Empty title. Click to add title.",
    );
  });

  it("announces its keyboard shortcut", async () => {
    const container = await renderWithTitle("Shortcut");

    expect(titleButton(container).getAttribute("aria-keyshortcuts")).toBe(
      "Control+Shift+T to edit title text",
    );
  });

  it("renders the clock alongside the title", async () => {
    const container = await renderWithTitle("With clock");

    expect(
      container.querySelector("[data-testid='time-display']"),
    ).not.toBeNull();
  });

  it("makes the click target a button inside the heading", async () => {
    const container = await renderWithTitle("Button title");

    // The heading stays a heading and the control inside it is a real button,
    // so Enter and Space activate it, it takes its place in the tab order and
    // assistive technology announces a button instead of a clickable heading.
    const button = titleButton(container);
    expect(button.tagName).toBe("BUTTON");
    expect(button.type).toBe("button");
    expect(button.closest("h1")).not.toBeNull();
    expect(button.tabIndex).toBe(0);
  });
});

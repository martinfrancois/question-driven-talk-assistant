import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { Footer } from "./Footer.tsx";
import { StorageName } from "@/stores";
import { pressKey } from "@/test-utils/keyboard.ts";
import { interact } from "@/test-utils/react.ts";

/**
 * Renders the real `Footer` against the real zustand layout store and the real
 * `react-hotkeys-hook`. Only `window.prompt` is stubbed, because a native
 * browser dialog cannot run unattended.
 */
describe("Footer", () => {
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

  const footer = (container: HTMLElement): HTMLElement => {
    const el = container.querySelector<HTMLElement>(
      "[data-testid='main-footer']",
    );
    if (!el) throw new Error("footer not rendered");
    return el;
  };

  /**
   * The layout store is shared by every test in this file, so drive it to a
   * known footer through the component's own edit flow first.
   */
  const renderWithFooter = async (text: string): Promise<HTMLElement> => {
    const { container } = await render(<Footer />);
    promptAnswer = text;
    await interact(() => footer(container).click());
    promptCalls = [];
    promptAnswer = null;
    return container;
  };

  it("renders the footer held in the store", async () => {
    const container = await renderWithFooter("François Martin");

    expect(footer(container).textContent).toBe("François Martin");
  });

  it("writes the prompt answer back into the store", async () => {
    const container = await renderWithFooter("Old footer");

    promptAnswer = "New footer";
    await interact(() => footer(container).click());

    expect(promptCalls).toEqual(["Edit Footer"]);
    expect(footer(container).textContent).toBe("New footer");
  });

  it("keeps the footer when the prompt is cancelled", async () => {
    const container = await renderWithFooter("Unchanged");

    promptAnswer = null;
    await interact(() => footer(container).click());

    expect(footer(container).textContent).toBe("Unchanged");
  });

  it("opens the footer prompt via the ctrl+shift+f hotkey", async () => {
    const container = await renderWithFooter("Before hotkey");

    promptAnswer = "After hotkey";
    await interact(() => {
      pressKey({ key: "F", code: "KeyF", ctrl: true, shift: true });
    });

    expect(promptCalls).toEqual(["Edit Footer"]);
    expect(footer(container).textContent).toBe("After hotkey");
  });

  it("ignores the hotkey when the ctrl modifier is missing", async () => {
    await renderWithFooter("Untouched");

    await interact(() => {
      pressKey({ key: "F", code: "KeyF", shift: true });
    });

    expect(promptCalls).toEqual([]);
  });

  it("describes a filled footer for assistive technology", async () => {
    const container = await renderWithFooter("My footer");

    expect(footer(container).getAttribute("aria-label")).toBe(
      "Footer text: My footer. Click to edit footer.",
    );
  });

  it("describes a whitespace-only footer as empty for assistive technology", async () => {
    const container = await renderWithFooter("  ");

    expect(footer(container).getAttribute("aria-label")).toBe(
      "Empty footer. Click to add footer.",
    );
  });

  it("announces its keyboard shortcut", async () => {
    const container = await renderWithFooter("Shortcut");

    expect(footer(container).getAttribute("aria-keyshortcuts")).toBe(
      "Control+Shift+F to edit footer text",
    );
  });
});

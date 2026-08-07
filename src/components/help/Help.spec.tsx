import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { renderHook, act } from "@testing-library/react";
import { Help } from "./Help.tsx";
import { StorageName, useCompleteTour, useTourCompleted } from "@/stores";
import { pressKey } from "@/test-utils/keyboard.ts";
import { interact } from "@/test-utils/react.ts";

/**
 * Drives the real help surface: the real `react-hotkeys-hook` binding, the real
 * Radix dialog primitive (which portals into `document.body`), the real
 * `react-focus-lock` wrapper, the real `virtual:pwa-register/react` hook from
 * vite-plugin-pwa, and the real zustand onboarding store. Nothing is mocked.
 */
describe("Help", () => {
  beforeEach(() => {
    localStorage.removeItem(StorageName.ONBOARDING);
  });

  const tourHook = () =>
    renderHook(() => ({
      tourCompleted: useTourCompleted(),
      completeTour: useCompleteTour(),
    }));

  const modal = (): HTMLElement | null =>
    document.body.querySelector("[data-testid='help-modal']");

  const helpIcon = (container: HTMLElement): HTMLElement => {
    const el = container.querySelector<HTMLElement>(
      "[data-testid='help-icon']",
    );
    if (!el) throw new Error("help icon not rendered");
    return el;
  };

  const openViaIcon = async (container: HTMLElement) => {
    await interact(() => helpIcon(container).click());
  };

  it("renders a labelled help button and no modal at first", async () => {
    const { container } = await render(<Help />);

    expect(helpIcon(container).getAttribute("aria-label")).toBe("Open help");
    expect(helpIcon(container).querySelector("svg")).not.toBeNull();
    expect(modal()).toBeNull();
  });

  it("opens the modal when the help button is clicked", async () => {
    const { container } = await render(<Help />);

    await openViaIcon(container);

    expect(modal()).not.toBeNull();
    expect(modal()?.textContent).toContain("Help");
  });

  it("opens the modal via the ctrl+h hotkey", async () => {
    await render(<Help />);

    await interact(() => {
      pressKey({ key: "h", code: "KeyH", ctrl: true });
    });

    expect(modal()).not.toBeNull();
  });

  it("lists the application shortcuts in a table with a caption", async () => {
    const { container } = await render(<Help />);

    await openViaIcon(container);

    const table = modal()?.querySelector("table");
    expect(table).not.toBeNull();
    expect(table?.querySelector("caption")?.textContent).toBe(
      "Keyboard Shortcuts and Descriptions",
    );
    const headers = Array.from(table?.querySelectorAll("thead th") ?? []).map(
      (th) => th.textContent,
    );
    expect(headers).toEqual(["Shortcut", "Description"]);
  });

  it("documents every section of shortcuts", async () => {
    const { container } = await render(<Help />);

    await openViaIcon(container);

    const sectionHeadings = Array.from(
      modal()?.querySelectorAll("tbody th[colspan='2']") ?? [],
    ).map((th) => th.textContent);

    expect(sectionHeadings).toEqual([
      "Features",
      "Managing Questions",
      "Reordering Questions",
      "Navigation",
      "Highlighting & Answering",
    ]);
  });

  it("documents the shortcuts the application actually binds", async () => {
    const { container } = await render(<Help />);

    await openViaIcon(container);
    const text = modal()?.textContent ?? "";

    expect(text).toContain("Increase font size");
    expect(text).toContain("Decrease font size");
    expect(text).toContain("Toggle dark mode");
    expect(text).toContain("Show a large QR code on the screen");
    expect(text).toContain("Enter full-screen mode");
    expect(text).toContain("Save questions to a Markdown file");
    expect(text).toContain("Show help (this pop-up window)");
    expect(text).toContain("Edit title text");
    expect(text).toContain("Edit footer text");
    expect(text).toContain("Edit QR code URL");
    expect(text).toContain("Clear all questions (with confirmation)");
    expect(text).toContain("Move the current question up");
    expect(text).toContain("Move the current question down");
    expect(text).toContain("Mark question as answered");
  });

  it("renders the shortcut keys as kbd elements", async () => {
    const { container } = await render(<Help />);

    await openViaIcon(container);

    const keys = Array.from(modal()?.querySelectorAll("kbd") ?? []).map(
      (kbd) => kbd.textContent,
    );
    expect(keys.length).toBeGreaterThan(10);
    expect(keys).toContain("Ctrl");
    expect(keys).toContain("Shift");
    expect(keys).toContain("Backspace");
  });

  it("links to the author and the source repository, safely", async () => {
    const { container } = await render(<Help />);

    await openViaIcon(container);

    const links = Array.from(modal()?.querySelectorAll("a") ?? []);
    const hrefs = links.map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("https://www.fmartin.ch");
    expect(hrefs).toContain(
      "https://github.com/martinfrancois/question-driven-talk-assistant",
    );
    for (const link of links) {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("hides the update button while no service worker update is pending", async () => {
    const { container } = await render(<Help />);

    await openViaIcon(container);

    expect(modal()?.textContent).not.toContain("New version available");
    expect(modal()?.textContent).not.toContain("Update to the latest version");
  });

  it("restarts the guided tour and closes the modal", async () => {
    const tour = tourHook();
    act(() => {
      tour.result.current.completeTour();
    });
    expect(tour.result.current.tourCompleted).toBe(true);

    const { container } = await render(<Help />);
    await openViaIcon(container);

    const restart = modal()?.querySelector<HTMLElement>(
      "[data-testid='restart-tour']",
    );
    expect(restart).not.toBeNull();
    await interact(() => restart?.click());

    expect(tour.result.current.tourCompleted).toBe(false);
    expect(modal()).toBeNull();
  });

  it("closes when the dialog close button is used", async () => {
    const { container } = await render(<Help />);

    await openViaIcon(container);
    const close = document.body.querySelector<HTMLElement>(
      "[data-testid='modal-close']",
    );
    await interact(() => close?.click());

    expect(modal()).toBeNull();
  });

  it("can be reopened after closing", async () => {
    const { container } = await render(<Help />);

    await openViaIcon(container);
    await interact(() =>
      document.body
        .querySelector<HTMLElement>("[data-testid='modal-close']")
        ?.click(),
    );
    await openViaIcon(container);

    expect(modal()).not.toBeNull();
  });

  it("moves focus into the dialog when it opens", async () => {
    const { container } = await render(<Help />);

    await openViaIcon(container);

    expect(modal()?.contains(document.activeElement)).toBe(true);
  });

  it("describes itself for assistive technology", async () => {
    const { container } = await render(<Help />);

    await openViaIcon(container);

    const description = modal()?.querySelector(".sr-only");
    expect(description?.textContent).toContain(
      "Help dialog containing information about shortcuts, features,",
    );
    expect(description?.textContent).toContain(
      "and a button to restart the guided tour.",
    );
  });
});

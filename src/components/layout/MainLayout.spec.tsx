import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import MainLayout from "./MainLayout.tsx";
import { StorageName } from "@/stores";

/**
 * Renders the whole layout tree for real: `SkipLink`, `Header`, `TimeDisplay`,
 * `MainContent`, the dnd-kit powered `QuestionList` with its `QuestionItem`
 * rows, the `qrcode.react` powered `QrCodeComponent`, and `Footer`. No child is
 * stubbed, so a breaking change in dnd-kit, radix, qrcode.react or the stores
 * surfaces as a failure here rather than as a green test over a fake tree.
 */
describe("MainLayout", () => {
  beforeEach(() => {
    localStorage.removeItem(StorageName.LAYOUT);
    localStorage.removeItem(StorageName.QUESTIONS);
    localStorage.removeItem(StorageName.QR_CODE);
    vi.stubGlobal("prompt", () => null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the layout container", async () => {
    const { container } = await render(<MainLayout />);

    expect(
      container.querySelector("[data-testid='main-layout-container']"),
    ).not.toBeNull();
  });

  it("puts a skip link first in the DOM so keyboard users reach it immediately", async () => {
    const { container } = await render(<MainLayout />);

    const layout = container.querySelector(
      "[data-testid='main-layout-container']",
    );
    const first = layout?.firstElementChild;

    expect(first?.tagName).toBe("A");
    expect(first?.textContent).toBe("Skip to content");
    expect(first?.getAttribute("href")).toBe("#question-text-0");
    expect(first?.getAttribute("aria-keyshortcuts")).toBe("Control+Shift+E");
  });

  it("points the skip link at an element that actually exists", async () => {
    const { container } = await render(<MainLayout />);

    const href = container
      .querySelector("[data-testid='main-layout-container'] > a")
      ?.getAttribute("href");
    expect(href).toBe("#question-text-0");
    expect(container.querySelector("#question-text-0")).not.toBeNull();
  });

  it("renders header, main, aside and footer landmarks", async () => {
    const { container } = await render(<MainLayout />);

    expect(container.querySelector("header")).not.toBeNull();
    expect(container.querySelector("main")).not.toBeNull();
    expect(container.querySelector("aside")).not.toBeNull();
    expect(container.querySelector("footer")).not.toBeNull();
  });

  it("renders the question list with the questions held in the store", async () => {
    const { container } = await render(<MainLayout />);

    const list = container.querySelector("[role='list']");
    expect(list).not.toBeNull();
    expect(list?.querySelectorAll("[role='listitem']").length).toBeGreaterThan(
      0,
    );
    expect(container.querySelectorAll("textarea").length).toBeGreaterThan(0);
  });

  it("renders the QR code placeholder in the aside", async () => {
    const { container } = await render(<MainLayout />);

    const aside = container.querySelector("aside");
    expect(aside?.querySelector("[data-testid='qr-code']")).not.toBeNull();
  });

  it("announces the fullscreen shortcut on the content wrapper", async () => {
    const { container } = await render(<MainLayout />);

    expect(
      container.querySelector("[aria-keyshortcuts]")?.closest("div"),
    ).not.toBeNull();
    expect(
      container.querySelector(
        "[aria-keyshortcuts='Control+f to make website full screen']",
      ),
    ).not.toBeNull();
  });
});

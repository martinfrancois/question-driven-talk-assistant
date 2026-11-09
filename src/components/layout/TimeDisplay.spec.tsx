import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { act } from "@testing-library/react";
import TimeDisplay from "./TimeDisplay.tsx";
import { StorageName } from "@/stores";
import { formatTime } from "@/lib/time.ts";

/**
 * Renders the real component against the real preferences store and the real
 * `Intl`-backed `Date#toLocaleTimeString`, so a regression in either the store
 * wiring or the formatting shows up here.
 */
describe("TimeDisplay", () => {
  beforeEach(() => {
    localStorage.removeItem(StorageName.PREFERENCES);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const button = (container: HTMLElement): HTMLButtonElement => {
    const el = container.querySelector<HTMLButtonElement>(
      "[data-testid='time-display']",
    );
    if (!el) throw new Error("time display button not rendered");
    return el;
  };

  const click = async (el: HTMLElement): Promise<void> => {
    await act(async () => {
      el.click();
      await Promise.resolve();
    });
  };

  /**
   * The preferences store is shared by every test in this file, so put it into
   * a known 24h state before asserting anything.
   */
  const renderIn24h = async (): Promise<HTMLElement> => {
    const { container } = await render(<TimeDisplay />);
    if (button(container).dataset.timeFormat !== "24h") {
      await click(button(container));
    }
    return container;
  };

  it("renders a 24 hour time by default", async () => {
    const container = await renderIn24h();

    expect(button(container).dataset.timeFormat).toBe("24h");
    expect(button(container).textContent).toMatch(/^\d{2}:\d{2}$/);
  });

  it("switches to a 12 hour time when clicked", async () => {
    const container = await renderIn24h();

    await click(button(container));

    expect(button(container).dataset.timeFormat).toBe("12h");
    expect(button(container).textContent).toMatch(/^\d{1,2}:\d{2}\s?[AP]M$/i);
  });

  it("switches back to 24 hour time on a second click", async () => {
    const container = await renderIn24h();

    await click(button(container));
    await click(button(container));

    expect(button(container).dataset.timeFormat).toBe("24h");
    expect(button(container).textContent).toMatch(/^\d{2}:\d{2}$/);
  });

  it("exposes the rendered time in its accessible name", async () => {
    const container = await renderIn24h();
    const el = button(container);

    expect(el.getAttribute("aria-label")).toBe(`Time: ${el.textContent ?? ""}`);
  });

  it("keeps the accessible name in sync after toggling the format", async () => {
    const container = await renderIn24h();

    await click(button(container));

    const el = button(container);
    expect(el.getAttribute("aria-label")).toBe(`Time: ${el.textContent ?? ""}`);
  });

  it("moves to the next minute on the minute boundary", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    const boundary = new Date(2026, 10, 9, 12, 35);
    const msBeforeBoundary = 500;
    vi.setSystemTime(boundary.getTime() - msBeforeBoundary);
    const container = await renderIn24h();
    const before = formatTime(new Date(2026, 10, 9, 12, 34), true);
    const after = formatTime(boundary, true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(msBeforeBoundary - 1);
    });
    expect(button(container).textContent).toBe(before);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(button(container).textContent).toBe(after);
  });

  it("leaves no timer running after unmount", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const rendered = await render(<TimeDisplay />);
    expect(vi.getTimerCount()).toBe(1);

    await rendered.unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});

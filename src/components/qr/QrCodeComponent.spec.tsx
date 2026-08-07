import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { renderHook, act } from "@testing-library/react";
import QrCodeComponent from "./QrCodeComponent.tsx";
import { StorageName, useSetQrCodeSize, useSetQrCodeUrl } from "@/stores";
import { keyDown, pressKey } from "@/test-utils/keyboard.ts";
import { interact } from "@/test-utils/react.ts";

const DEFAULT_SIZE = 100;
const MIN_SIZE = 32;
const MAX_SIZE = 256;

/**
 * Exercises the real component together with the real `qrcode.react` renderer,
 * the real `@react-aria/interactions` move handling and the real zustand QR
 * store. The generated SVG is asserted on directly, so a regression in
 * qrcode.react (or in the size plumbing) fails the test.
 */
describe("QrCodeComponent", () => {
  let promptCalls: (string | undefined)[] = [];
  let promptAnswer: string | null = null;

  beforeEach(() => {
    promptCalls = [];
    promptAnswer = null;
    localStorage.removeItem(StorageName.QR_CODE);
    vi.stubGlobal("prompt", (message?: string) => {
      promptCalls.push(message);
      return promptAnswer;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const storeSetters = () =>
    renderHook(() => ({
      setUrl: useSetQrCodeUrl(),
      setSize: useSetQrCodeSize(),
    }));

  /**
   * The QR store is shared by every test in this file, so put it into a known
   * state before rendering.
   */
  const renderWith = async (url: string, size = DEFAULT_SIZE) => {
    const { result } = storeSetters();
    act(() => {
      result.current.setUrl(url);
    });
    act(() => {
      result.current.setSize(size);
    });
    return render(<QrCodeComponent />);
  };

  const wrapper = (container: HTMLElement): HTMLElement => {
    const el = container.querySelector<HTMLElement>("[data-testid='qr-code']");
    if (!el) throw new Error("qr code wrapper not rendered");
    return el;
  };

  it("shows a placeholder instead of a QR code when no url is set", async () => {
    const { container } = await renderWith("");

    expect(
      container.querySelector("[data-testid='qr-code-placeholder']"),
    ).not.toBeNull();
    expect(container.querySelector("[data-testid='qr-code-svg']")).toBeNull();
    expect(wrapper(container).getAttribute("aria-label")).toBe(
      "No QR Code set. Click to enter a URL",
    );
  });

  it("renders a real QR code svg once a url is set", async () => {
    const { container } = await renderWith("https://example.com/talk");

    const svg = container.querySelector<SVGSVGElement>(
      "[data-testid='qr-code-svg']",
    );
    expect(svg).not.toBeNull();
    expect(svg?.tagName.toLowerCase()).toBe("svg");
    // qrcode.react emits the modules as path data; an empty path would mean
    // the encoder produced nothing.
    const paths = svg?.querySelectorAll("path") ?? [];
    expect(paths.length).toBeGreaterThan(0);
    expect(
      Array.from(paths).some((p) => (p.getAttribute("d") ?? "").length > 20),
    ).toBe(true);
  });

  it("encodes different urls into different QR module data", async () => {
    const first = await renderWith("https://example.com/one");
    const firstPaths = Array.from(
      first.container.querySelectorAll("[data-testid='qr-code-svg'] path"),
    )
      .map((p) => p.getAttribute("d"))
      .join("");

    const second = await renderWith("https://example.com/a-different-url");
    const secondPaths = Array.from(
      second.container.querySelectorAll("[data-testid='qr-code-svg'] path"),
    )
      .map((p) => p.getAttribute("d"))
      .join("");

    expect(firstPaths.length).toBeGreaterThan(0);
    expect(secondPaths).not.toBe(firstPaths);
  });

  it("renders the QR code at the size held in the store", async () => {
    const { container } = await renderWith("https://example.com/talk", 128);

    const svg = container.querySelector<SVGSVGElement>(
      "[data-testid='qr-code-svg']",
    );
    expect(svg?.getAttribute("width")).toBe("128");
    expect(svg?.getAttribute("height")).toBe("128");
  });

  it("asks for a new url when clicked and stores the answer", async () => {
    const { container } = await renderWith("https://example.com/old");

    promptAnswer = "https://example.com/new";
    await interact(() => wrapper(container).click());

    expect(promptCalls).toEqual(["Enter QR Code URL"]);
    expect(wrapper(container).getAttribute("aria-label")).toBe(
      "QR Code. Click to change the URL",
    );
  });

  it("keeps the url when the prompt is cancelled", async () => {
    const { container } = await renderWith("https://example.com/keep");

    promptAnswer = null;
    await interact(() => wrapper(container).click());

    expect(
      container.querySelector("[data-testid='qr-code-svg']"),
    ).not.toBeNull();
  });

  it("hides the QR code when the url is cleared through the prompt", async () => {
    const { container } = await renderWith("https://example.com/clear-me");

    promptAnswer = "";
    await interact(() => wrapper(container).click());

    expect(
      container.querySelector("[data-testid='qr-code-placeholder']"),
    ).not.toBeNull();
  });

  it("opens the url prompt via the ctrl+shift+q hotkey", async () => {
    await renderWith("https://example.com/hotkey");

    promptAnswer = null;
    await interact(() => {
      pressKey({ key: "Q", code: "KeyQ", ctrl: true, shift: true });
    });

    expect(promptCalls).toEqual(["Enter QR Code URL"]);
  });

  it("opens the url prompt when Enter is pressed on the wrapper", async () => {
    const { container } = await renderWith("https://example.com/enter");

    promptAnswer = null;
    await interact(() => {
      keyDown({ key: "Enter", code: "Enter", target: wrapper(container) });
    });

    expect(promptCalls).toEqual(["Enter QR Code URL"]);
  });

  it("opens the url prompt when Space is pressed on the wrapper", async () => {
    const { container } = await renderWith("https://example.com/space");

    promptAnswer = null;
    await interact(() => {
      keyDown({ key: " ", code: "Space", target: wrapper(container) });
    });

    expect(promptCalls).toEqual(["Enter QR Code URL"]);
  });

  it("ignores unrelated keys on the wrapper", async () => {
    const { container } = await renderWith("https://example.com/ignore");

    await interact(() => {
      keyDown({ key: "a", code: "KeyA", target: wrapper(container) });
    });

    expect(promptCalls).toEqual([]);
  });

  it("only offers resize handles once a url is set", async () => {
    const empty = await renderWith("");
    expect(
      empty.container.querySelector(
        "[data-testid='qr-code-resize-bottom-right']",
      ),
    ).toBeNull();

    const filled = await renderWith("https://example.com/handles");
    expect(
      filled.container.querySelector(
        "[data-testid='qr-code-resize-bottom-right']",
      ),
    ).not.toBeNull();
    expect(
      filled.container.querySelector(
        "[data-testid='qr-code-resize-bottom-left']",
      ),
    ).not.toBeNull();
  });

  it("exposes the resize handles as sliders with the current size", async () => {
    const { container } = await renderWith("https://example.com/aria", 120);

    const handle = container.querySelector(
      "[data-testid='qr-code-resize-bottom-right']",
    );
    expect(handle?.getAttribute("role")).toBe("slider");
    expect(handle?.getAttribute("aria-label")).toBe("Resize bottom right");
    expect(handle?.getAttribute("aria-valuemin")).toBe(String(MIN_SIZE));
    expect(handle?.getAttribute("aria-valuemax")).toBe(String(MAX_SIZE));
    expect(handle?.getAttribute("aria-valuenow")).toBe("120");
    expect(handle?.getAttribute("aria-valuetext")).toBe("120px");
  });

  const handleAt = (
    container: HTMLElement,
    corner: "right" | "left",
  ): HTMLElement => {
    const el = container.querySelector<HTMLElement>(
      `[data-testid='qr-code-resize-bottom-${corner}']`,
    );
    if (!el) throw new Error(`resize handle ${corner} not rendered`);
    return el;
  };

  const svgWidth = (container: HTMLElement): string | null | undefined =>
    container
      .querySelector("[data-testid='qr-code-svg']")
      ?.getAttribute("width");

  it("grows the QR code by 4px per arrow key press", async () => {
    const { container } = await renderWith("https://example.com/grow", 100);

    await interact(() => {
      keyDown({
        key: "ArrowRight",
        code: "ArrowRight",
        target: handleAt(container, "right"),
      });
    });

    expect(svgWidth(container)).toBe("104");
  });

  it("grows the QR code by 16px when shift is held", async () => {
    const { container } = await renderWith(
      "https://example.com/grow-fast",
      100,
    );

    await interact(() => {
      keyDown({
        key: "ArrowUp",
        code: "ArrowUp",
        shift: true,
        target: handleAt(container, "right"),
      });
    });

    expect(svgWidth(container)).toBe("116");
  });

  it("shrinks the QR code with the left and down arrows", async () => {
    const { container } = await renderWith("https://example.com/shrink", 100);

    await interact(() => {
      keyDown({
        key: "ArrowLeft",
        code: "ArrowLeft",
        target: handleAt(container, "left"),
      });
    });
    await interact(() => {
      keyDown({
        key: "ArrowDown",
        code: "ArrowDown",
        target: handleAt(container, "left"),
      });
    });

    expect(svgWidth(container)).toBe("92");
  });

  it("clamps the size at the 256px maximum", async () => {
    const { container } = await renderWith("https://example.com/max", 250);

    await interact(() => {
      keyDown({
        key: "ArrowRight",
        code: "ArrowRight",
        shift: true,
        target: handleAt(container, "right"),
      });
    });

    expect(svgWidth(container)).toBe(String(MAX_SIZE));
  });

  it("clamps the size at the 32px minimum", async () => {
    const { container } = await renderWith("https://example.com/min", 34);

    await interact(() => {
      keyDown({
        key: "ArrowLeft",
        code: "ArrowLeft",
        shift: true,
        target: handleAt(container, "right"),
      });
    });

    expect(svgWidth(container)).toBe(String(MIN_SIZE));
  });

  it("leaves the size alone for keys that are not arrows", async () => {
    const { container } = await renderWith("https://example.com/noop", 100);

    await interact(() => {
      keyDown({
        key: "a",
        code: "KeyA",
        target: handleAt(container, "right"),
      });
    });

    expect(svgWidth(container)).toBe("100");
  });

  it("prevents the default scroll behaviour of the arrow keys", async () => {
    const { container } = await renderWith("https://example.com/prevent", 100);

    let event!: KeyboardEvent;
    await interact(() => {
      event = keyDown({
        key: "ArrowRight",
        code: "ArrowRight",
        target: handleAt(container, "right"),
      });
    });

    expect(event.defaultPrevented).toBe(true);
  });
});

/**
 * Pointer driven resizing goes through the real `useMove` hook from
 * `@react-aria/interactions`: the tests dispatch genuine `PointerEvent`s and
 * assert the size the component derives from the deltas react-aria reports.
 */
describe("QrCodeComponent pointer resizing", () => {
  let promptCalls: (string | undefined)[] = [];

  beforeEach(() => {
    promptCalls = [];
    localStorage.removeItem(StorageName.QR_CODE);
    vi.stubGlobal("prompt", (message?: string) => {
      promptCalls.push(message);
      return null;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderAtSize = async (size: number) => {
    const { result } = renderHook(() => ({
      setUrl: useSetQrCodeUrl(),
      setSize: useSetQrCodeSize(),
    }));
    act(() => {
      result.current.setUrl("https://example.com/resize");
    });
    act(() => {
      result.current.setSize(size);
    });
    return render(<QrCodeComponent />);
  };

  const pointer = (
    type: string,
    init: PointerEventInit & { clientX: number; clientY: number },
  ): PointerEvent =>
    new PointerEvent(type, {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      buttons: 1,
      isPrimary: true,
      bubbles: true,
      cancelable: true,
      ...init,
    });

  /** Performs a real pointer drag on one of the resize handles. */
  const drag = async (
    container: HTMLElement,
    corner: "right" | "left",
    dx: number,
    dy: number,
  ): Promise<void> => {
    const handle = container.querySelector<HTMLElement>(
      `[data-testid='qr-code-resize-bottom-${corner}']`,
    );
    if (!handle) throw new Error(`resize handle ${corner} not rendered`);

    await interact(() => {
      handle.dispatchEvent(
        pointer("pointerdown", { clientX: 200, clientY: 200 }),
      );
    });
    await interact(() => {
      window.dispatchEvent(
        pointer("pointermove", { clientX: 200 + dx, clientY: 200 + dy }),
      );
    });
    await interact(() => {
      window.dispatchEvent(
        pointer("pointerup", {
          clientX: 200 + dx,
          clientY: 200 + dy,
          buttons: 0,
        }),
      );
    });
  };

  const svgWidth = (container: HTMLElement): string | null | undefined =>
    container
      .querySelector("[data-testid='qr-code-svg']")
      ?.getAttribute("width");

  it("grows the QR code when the bottom right handle is dragged outwards", async () => {
    const { container } = await renderAtSize(100);

    await drag(container, "right", 40, 0);

    await vi.waitFor(() => {
      if (svgWidth(container) !== "140") {
        throw new Error(`size is ${String(svgWidth(container))}`);
      }
    });
    expect(svgWidth(container)).toBe("140");
  });

  it("grows the QR code when the bottom left handle is dragged outwards", async () => {
    const { container } = await renderAtSize(100);

    await drag(container, "left", -40, 0);

    await vi.waitFor(() => {
      if (svgWidth(container) !== "140") {
        throw new Error(`size is ${String(svgWidth(container))}`);
      }
    });
    expect(svgWidth(container)).toBe("140");
  });

  it("clamps a pointer drag to the maximum size", async () => {
    const { container } = await renderAtSize(200);

    await drag(container, "right", 400, 0);

    await vi.waitFor(() => {
      if (svgWidth(container) !== String(MAX_SIZE)) {
        throw new Error(`size is ${String(svgWidth(container))}`);
      }
    });
    expect(svgWidth(container)).toBe(String(MAX_SIZE));
  });

  it("clamps a pointer drag to the minimum size", async () => {
    const { container } = await renderAtSize(100);

    await drag(container, "right", -400, -400);

    await vi.waitFor(() => {
      if (svgWidth(container) !== String(MIN_SIZE)) {
        throw new Error(`size is ${String(svgWidth(container))}`);
      }
    });
    expect(svgWidth(container)).toBe(String(MIN_SIZE));
  });

  it("restores the document's text selection after a drag", async () => {
    const { container } = await renderAtSize(100);
    const before = document.body.style.userSelect;

    await drag(container, "right", 20, 0);

    expect(document.body.style.userSelect).toBe(before);
  });

  it("does not treat the end of a drag as a click on the QR code", async () => {
    const { container } = await renderAtSize(100);

    await drag(container, "right", 20, 0);
    const promptsBefore = promptCalls.length;
    await interact(() => {
      container.querySelector<HTMLElement>("[data-testid='qr-code']")?.click();
    });

    expect(promptCalls.length).toBe(promptsBefore);
  });
});

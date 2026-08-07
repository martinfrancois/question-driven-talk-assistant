import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { renderHook, act } from "@testing-library/react";
import screenfull from "screenfull";
import App from "./App.tsx";
import {
  StorageName,
  useCompleteTour,
  useFontSize,
  useSetFooter,
  useSetQuestions,
  useSetTitle,
} from "./stores";
import { pressKey } from "./test-utils/keyboard.ts";
import { interact } from "./test-utils/react.ts";

interface RecordedWrite {
  fileName: string | undefined;
  content: string;
}

/**
 * Integration coverage for the application shell. The whole real component tree
 * is mounted: the real zustand stores, the real `react-hotkeys-hook` bindings,
 * the real Radix dialogs, the real `qrcode.react` and dnd-kit powered content,
 * the real `virtual:pwa-register/react` hook and the real `react-joyride` tour.
 *
 * Two host capabilities are intercepted because a headless test cannot supply
 * them: the File System Access save picker (a native chooser) and screenfull's
 * fullscreen transition (which the browser only grants after a user gesture).
 * Both are still asserted against their real API surface.
 */
describe("App", () => {
  let writes: RecordedWrite[] = [];

  // `@types/wicg-file-system-access` declares `showSaveFilePicker` as always
  // present; this view of `window` makes it optional so the test can install
  // and remove its own implementation.
  interface OptionalPicker {
    showSaveFilePicker?: typeof window.showSaveFilePicker;
  }
  const testWindow: OptionalPicker = window;

  beforeEach(() => {
    writes = [];
    for (const name of Object.values(StorageName)) {
      localStorage.removeItem(name);
    }
    vi.stubGlobal("prompt", () => null);
    testWindow.showSaveFilePicker = (options?: SaveFilePickerOptions) => {
      let content = "";
      return Promise.resolve({
        createWritable: () =>
          Promise.resolve({
            write: (data: string) => {
              content += data;
              return Promise.resolve();
            },
            close: () => {
              writes.push({ fileName: options?.suggestedName, content });
              return Promise.resolve();
            },
          }),
      } as unknown as FileSystemFileHandle);
    };
  });

  afterEach(() => {
    delete testWindow.showSaveFilePicker;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const shell = (container: HTMLElement): HTMLElement => {
    const el = container.firstElementChild as HTMLElement | null;
    if (!el) throw new Error("app shell not rendered");
    return el;
  };

  const fontSizeHook = () => renderHook(() => useFontSize());

  /**
   * Renders the app with the guided tour already completed, so the joyride
   * overlay does not sit on top of the UI the assertions look at.
   */
  const renderApp = async () => {
    const setup = renderHook(() => ({
      completeTour: useCompleteTour(),
      setTitle: useSetTitle(),
      setFooter: useSetFooter(),
      setQuestions: useSetQuestions(),
    }));
    act(() => {
      setup.result.current.completeTour();
    });
    return render(<App />);
  };

  it("renders the whole application shell", async () => {
    const { container } = await renderApp();

    expect(
      container.querySelector("[data-testid='main-layout-container']"),
    ).not.toBeNull();
    expect(
      container.querySelector("[data-testid='main-header']"),
    ).not.toBeNull();
    expect(
      container.querySelector("[data-testid='main-footer']"),
    ).not.toBeNull();
    expect(container.querySelector("[data-testid='qr-code']")).not.toBeNull();
    expect(container.querySelector("[data-testid='help-icon']")).not.toBeNull();
    expect(container.querySelector("textarea")).not.toBeNull();
  });

  it("applies the current font size to the shell", async () => {
    const { container } = await renderApp();
    const font = fontSizeHook();

    expect(shell(container).style.fontSize).toBe(
      `${String(font.result.current)}px`,
    );
  });

  it("grows the font size on ctrl+p", async () => {
    const { container } = await renderApp();
    const before = Number.parseInt(shell(container).style.fontSize, 10);

    await interact(() => {
      pressKey({ key: "p", code: "KeyP", ctrl: true });
    });

    expect(Number.parseInt(shell(container).style.fontSize, 10)).toBe(
      before + 2,
    );
  });

  it("shrinks the font size on ctrl+m", async () => {
    const { container } = await renderApp();
    const before = Number.parseInt(shell(container).style.fontSize, 10);

    await interact(() => {
      pressKey({ key: "m", code: "KeyM", ctrl: true });
    });

    expect(Number.parseInt(shell(container).style.fontSize, 10)).toBe(
      before - 2,
    );
  });

  it("toggles the dark mode class on ctrl+d", async () => {
    const { container } = await renderApp();
    const initial = shell(container).classList.contains("dark");

    await interact(() => {
      pressKey({ key: "d", code: "KeyD", ctrl: true });
    });
    expect(shell(container).classList.contains("dark")).toBe(!initial);

    await interact(() => {
      pressKey({ key: "d", code: "KeyD", ctrl: true });
    });
    expect(shell(container).classList.contains("dark")).toBe(initial);
    expect(shell(container).classList.contains("light")).toBe(true);
  });

  it("saves the questions as markdown on ctrl+s", async () => {
    const setup = renderHook(() => ({
      completeTour: useCompleteTour(),
      setTitle: useSetTitle(),
      setFooter: useSetFooter(),
      setQuestions: useSetQuestions(),
    }));
    act(() => {
      setup.result.current.completeTour();
      setup.result.current.setTitle("My Talk!");
      setup.result.current.setFooter("Some Footer");
      setup.result.current.setQuestions([
        {
          id: "1",
          text: "First question?",
          answered: true,
          highlighted: false,
        },
        {
          id: "2",
          text: "Second question?",
          answered: false,
          highlighted: false,
        },
      ]);
    });
    await render(<App />);

    await interact(() => {
      pressKey({ key: "s", code: "KeyS", ctrl: true });
    });
    await vi.waitFor(() => {
      if (writes.length === 0) throw new Error("no file written yet");
    });

    expect(writes).toHaveLength(1);
    expect(writes[0].fileName).toMatch(
      /^\d{4}-\d{2}-\d{2}_my-talk_questions\.md$/,
    );
    expect(writes[0].content).toContain("# My Talk!\n\nSome Footer\n\n");
    expect(writes[0].content).toContain("- [x] First question?\n");
    expect(writes[0].content).toContain("- [ ] Second question?\n");
  });

  it("runs in a browser where screenfull reports fullscreen support", () => {
    expect(screenfull.isEnabled).toBe(true);
  });

  it("asks screenfull to enter and leave fullscreen on ctrl+f", async () => {
    const request = vi
      .spyOn(screenfull, "request")
      .mockResolvedValue(undefined);
    const exit = vi.spyOn(screenfull, "exit").mockResolvedValue(undefined);
    await renderApp();

    await interact(() => {
      pressKey({ key: "f", code: "KeyF", ctrl: true });
    });
    await vi.waitFor(() => {
      if (request.mock.calls.length === 0) {
        throw new Error("fullscreen not requested yet");
      }
    });
    expect(exit).not.toHaveBeenCalled();

    await interact(() => {
      pressKey({ key: "f", code: "KeyF", ctrl: true });
    });
    await vi.waitFor(() => {
      if (exit.mock.calls.length === 0) {
        throw new Error("fullscreen not exited yet");
      }
    });

    expect(request).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledTimes(1);
  });

  it("suppresses the browser's own find-in-page binding for ctrl+f", async () => {
    vi.spyOn(screenfull, "request").mockResolvedValue(undefined);
    await renderApp();

    const event = new KeyboardEvent("keydown", {
      key: "f",
      code: "KeyF",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    await interact(() => {
      window.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(true);
  });

  it("leaves unrelated keystrokes alone", async () => {
    const { container } = await renderApp();
    const before = shell(container).style.fontSize;

    const event = new KeyboardEvent("keydown", {
      key: "g",
      code: "KeyG",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    await interact(() => {
      window.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(false);
    expect(shell(container).style.fontSize).toBe(before);
  });

  it("opens the help modal from the app shell via ctrl+h", async () => {
    await renderApp();

    await interact(() => {
      pressKey({ key: "h", code: "KeyH", ctrl: true });
    });

    expect(
      document.body.querySelector("[data-testid='help-modal']"),
    ).not.toBeNull();
  });

  // Kept last: unmounting tears down the shared render root that the
  // `renderHook` helpers in the other tests rely on.
  it("stops listening for ctrl+f once unmounted", async () => {
    const request = vi
      .spyOn(screenfull, "request")
      .mockResolvedValue(undefined);
    const rendered = await renderApp();

    await rendered.unmount();
    await interact(() => {
      pressKey({ key: "f", code: "KeyF", ctrl: true, target: window });
    });

    expect(request).not.toHaveBeenCalled();
  });
});

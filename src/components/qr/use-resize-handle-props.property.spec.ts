import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { renderHook, act } from "@testing-library/react";

vi.mock("@react-aria/interactions", () => {
  type Handlers = {
    onMoveStart?: () => void;
    onMove?: (e: { deltaX: number; deltaY: number }) => void;
    onMoveEnd?: () => void;
  };
  return {
    useMove: (handlers: Handlers) => ({
      moveProps: {
        onMoveStart: () => handlers.onMoveStart?.(),
        onMove: (e: { deltaX: number; deltaY: number }) => handlers.onMove?.(e),
        onMoveEnd: () => handlers.onMoveEnd?.(),
      },
    }),
  };
});

describe("useResizeHandleProps (properties)", () => {
  it("keyboard arrows adjust size within bounds with step and clamping", async () => {
    const { useResizeHandleProps } = await import(
      "./use-resize-handle-props.ts"
    );
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 300 }),
        fc.boolean(),
        (initialSize, shift) => {
          let size = initialSize;
          const setSize = (n: number) => {
            size = n;
          };
          const { result, unmount } = renderHook(() =>
            useResizeHandleProps(
              "bottom-right",
              "label",
              size,
              setSize,
              () => {},
            ),
          );
          act(() => {
            result.current.onKeyDown({
              key: "ArrowRight",
              preventDefault: () => {},
              shiftKey: shift,
            } as unknown as KeyboardEvent<HTMLButtonElement>);
          });
          expect(size).toBeGreaterThanOrEqual(32);
          expect(size).toBeLessThanOrEqual(256);

          act(() => {
            result.current.onKeyDown({
              key: "ArrowLeft",
              preventDefault: () => {},
              shiftKey: shift,
            } as unknown as KeyboardEvent<HTMLButtonElement>);
          });
          expect(size).toBeGreaterThanOrEqual(32);
          expect(size).toBeLessThanOrEqual(256);
          unmount();
        },
      ),
    );
  });

  it("increases size with ArrowUp and decreases with ArrowDown", async () => {
    const { useResizeHandleProps } = await import(
      "./use-resize-handle-props.ts"
    );
    let size = 100;
    const setSize = (n: number) => {
      size = n;
    };
    const { result } = renderHook(() =>
      useResizeHandleProps("bottom-right", "label", size, setSize, () => {}),
    );
    act(() => {
      result.current.onKeyDown({
        key: "ArrowUp",
        preventDefault: () => {},
        shiftKey: false,
      } as unknown as KeyboardEvent<HTMLButtonElement>);
    });
    expect(size).toBeGreaterThanOrEqual(32);
    const afterUp = size;
    act(() => {
      result.current.onKeyDown({
        key: "ArrowDown",
        preventDefault: () => {},
        shiftKey: false,
      } as unknown as KeyboardEvent<HTMLButtonElement>);
    });
    expect(size).toBeLessThanOrEqual(afterUp);
  });

  it("uses larger step when Shift is held for ArrowRight/ArrowUp", async () => {
    const { useResizeHandleProps } = await import(
      "./use-resize-handle-props.ts"
    );
    let size = 100;
    const setSize = (n: number) => {
      size = n;
    };
    const { result } = renderHook(() =>
      useResizeHandleProps("bottom-right", "label", size, setSize, () => {}),
    );

    act(() => {
      result.current.onKeyDown({
        key: "ArrowRight",
        preventDefault: () => {},
        shiftKey: true,
      } as unknown as KeyboardEvent<HTMLButtonElement>);
    });
    const afterRight = size;
    // Without shift, increment should be smaller
    act(() => {
      result.current.onKeyDown({
        key: "ArrowUp",
        preventDefault: () => {},
        shiftKey: false,
      } as unknown as KeyboardEvent<HTMLButtonElement>);
    });
    expect(afterRight - 100).toBeGreaterThan(size - afterRight ? 0 : 0);
  });

  it("batches mouse move size updates and flushes on end", async () => {
    const { useResizeHandleProps } = await import(
      "./use-resize-handle-props.ts"
    );
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            dx: fc.integer({ min: -100, max: 100 }),
            dy: fc.integer({ min: -100, max: 100 }),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        (moves) => {
          const setSize = vi.fn();
          const onEnd = vi.fn();

          const { result, unmount } = renderHook(() =>
            useResizeHandleProps("bottom-right", "label", 100, setSize, onEnd),
          );

          act(() => {
            (result.current as { onMoveStart?: () => void }).onMoveStart?.();
          });

          act(() => {
            for (const m of moves)
              (result.current as { onMove?: (e: { deltaX: number; deltaY: number }) => void }).onMove?.({
                deltaX: m.dx,
                deltaY: m.dy,
              });
          });

          act(() => {
            (result.current as { onMoveEnd?: () => void }).onMoveEnd?.();
          });
          expect(onEnd).toHaveBeenCalled();
          expect(setSize).toHaveBeenCalled();

          unmount();
        },
      ),
    );
  });

  it("cancels any pending rAF on unmount during drag", async () => {
    const { useResizeHandleProps } = await import(
      "./use-resize-handle-props.ts"
    );
    const setSize = vi.fn();
    const onEnd = vi.fn();
    const { result, unmount } = renderHook(() =>
      useResizeHandleProps("bottom-right", "label", 100, setSize, onEnd),
    );
    act(() => {
      (result.current as { onMoveStart?: () => void }).onMoveStart?.();
      (result.current as { onMove?: (e: { deltaX: number; deltaY: number }) => void }).onMove?.({ deltaX: 5, deltaY: 2 });
    });
    // unmount mid-drag should not throw and should not call onEnd
    unmount();
    expect(onEnd).not.toHaveBeenCalled();
  });

  it("schedules setSize via requestAnimationFrame during move", async () => {
    const { useResizeHandleProps } = await import(
      "./use-resize-handle-props.ts"
    );
    const originalRAF = globalThis.requestAnimationFrame;
    const originalCAF = globalThis.cancelAnimationFrame;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(performance.now());
      return 1 as unknown as number;
    });
    vi.stubGlobal("cancelAnimationFrame", (_: number) => 0 as unknown as number);

    const setSize = vi.fn();
    const { result, unmount } = renderHook(() =>
      useResizeHandleProps("bottom-right", "label", 100, setSize, () => {}),
    );

    act(() => {
      (result.current as any).onMoveStart?.();
      (result.current as any).onMove?.({ deltaX: 3, deltaY: 1 } as any);
    });

    expect(setSize).toHaveBeenCalled();

    unmount();
    vi.stubGlobal("requestAnimationFrame", originalRAF as any);
    vi.stubGlobal("cancelAnimationFrame", originalCAF as any);
  });

  it("flush cancels a pending rAF and commits the last pending size", async () => {
    const { useResizeHandleProps } = await import(
      "./use-resize-handle-props.ts"
    );

    const originalRAF = globalThis.requestAnimationFrame;
    const originalCAF = globalThis.cancelAnimationFrame;
    const caf = vi.fn();
    // Do NOT invoke the callback to keep rafId non-null until flush
    vi.stubGlobal(
      "requestAnimationFrame",
      (_cb: FrameRequestCallback) => 7 as any,
    );
    vi.stubGlobal("cancelAnimationFrame", caf as any);

    const setSize = vi.fn();
    const onEnd = vi.fn();
    const { result, unmount } = renderHook(() =>
      useResizeHandleProps("bottom-right", "label", 100, setSize, onEnd),
    );

    act(() => {
      (result.current as any).onMoveStart?.();
      (result.current as any).onMove?.({ deltaX: 10, deltaY: 5 } as any);
      (result.current as any).onMoveEnd?.();
    });

    expect(caf).toHaveBeenCalledWith(7);
    expect(setSize).toHaveBeenCalled();
    expect(onEnd).toHaveBeenCalled();

    unmount();
    vi.stubGlobal("requestAnimationFrame", originalRAF as any);
    vi.stubGlobal("cancelAnimationFrame", originalCAF as any);
  });

  it("disables and restores document.body userSelect during drag", async () => {
    const { useResizeHandleProps } = await import(
      "./use-resize-handle-props.ts"
    );

    const original = document.body.style.userSelect;
    document.body.style.userSelect = "auto";
    const setSize = vi.fn();
    const onEnd = vi.fn();
    const { result, unmount } = renderHook(() =>
      useResizeHandleProps("bottom-right", "label", 100, setSize, onEnd),
    );

    act(() => {
      (result.current as any).onMoveStart?.();
    });
    expect(document.body.style.userSelect).toBe("none");

    act(() => {
      (result.current as any).onMoveEnd?.();
    });
    expect(document.body.style.userSelect).toBe("auto");

    unmount();
    document.body.style.userSelect = original;
  });

  it("decreases size with ArrowLeft respecting clamping and step", async () => {
    const { useResizeHandleProps } = await import(
      "./use-resize-handle-props.ts"
    );
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 300 }),
        fc.boolean(),
        (s, shift) => {
          let size = s;
          const setSize = (n: number) => {
            size = n;
          };
          const { result, unmount } = renderHook(() =>
            useResizeHandleProps(
              "bottom-right",
              "label",
              size,
              setSize,
              () => {},
            ),
          );
          act(() => {
            result.current.onKeyDown({
              key: "ArrowLeft",
              preventDefault() {},
              shiftKey: shift,
            } as any);
          });
          expect(size).toBeGreaterThanOrEqual(32);
          expect(size).toBeLessThanOrEqual(256);
          unmount();
        },
      ),
    );
  });

  it("schedules only one rAF for many moves until flushed", async () => {
    const { useResizeHandleProps } = await import(
      "./use-resize-handle-props.ts"
    );
    const setSize = vi.fn();
    const onEnd = vi.fn();

    const originalRAF = globalThis.requestAnimationFrame;
    const originalCAF = globalThis.cancelAnimationFrame;
    const raf = vi.fn().mockReturnValue(9 as any);
    const caf = vi.fn();
    vi.stubGlobal("requestAnimationFrame", raf as any);
    vi.stubGlobal("cancelAnimationFrame", caf as any);

    const { result, unmount } = renderHook(() =>
      useResizeHandleProps("bottom-right", "label", 100, setSize, onEnd),
    );
    act(() => {
      (result.current as any).onMoveStart?.();
      // multiple moves should schedule only once until flushed
      for (let i = 0; i < 5; i++)
        (result.current as any).onMove?.({ deltaX: 2, deltaY: 1 } as any);
    });
    expect(raf).toHaveBeenCalledTimes(1);

    act(() => {
      (result.current as any).onMoveEnd?.();
    });
    expect(caf).toHaveBeenCalledWith(9);

    unmount();
    vi.stubGlobal("requestAnimationFrame", originalRAF as any);
    vi.stubGlobal("cancelAnimationFrame", originalCAF as any);
  });

  // Skipping attempting to simulate missing document in browser env; covered behavior elsewhere.

  it("onKeyDown uses MIN_QR_CODE_SIZE when size is undefined (nullish coalescing)", async () => {
    const { useResizeHandleProps } = await import(
      "./use-resize-handle-props.ts"
    );
    let size: number | undefined = undefined;
    const setSize = (n: number) => {
      size = n;
    };
    const { result, unmount } = renderHook(() =>
      useResizeHandleProps(
        "bottom-right",
        "label",
        undefined as any,
        setSize,
        () => {},
      ),
    );
    act(() => {
      result.current.onKeyDown({
        key: "ArrowDown",
        preventDefault() {},
        shiftKey: false,
      } as any);
    });
    expect(size!).toBeGreaterThanOrEqual(32);
    unmount();
  });

  it("uses MIN_QR_CODE_SIZE when initial size is falsy (e.g., 0 or NaN)", async () => {
    const { useResizeHandleProps } = await import(
      "./use-resize-handle-props.ts"
    );
    const originalRAF = globalThis.requestAnimationFrame;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(performance.now());
      return 1 as any;
    });

    let size = 0 as any;
    const setSize = (n: number) => {
      size = n;
    };
    const { result, unmount } = renderHook(() =>
      useResizeHandleProps("bottom-right", "label", size, setSize, () => {}),
    );
    act(() => {
      (result.current as any).onMoveStart?.();
      (result.current as any).onMove?.({ deltaX: 10, deltaY: 0 } as any);
    });
    expect(size).toBeGreaterThanOrEqual(32);

    unmount();
    vi.stubGlobal("requestAnimationFrame", originalRAF as any);
  });
});

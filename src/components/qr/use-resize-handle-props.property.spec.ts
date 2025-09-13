import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { renderHook, act } from "@testing-library/react";

vi.mock("@react-aria/interactions", () => {
  return {
    useMove: (handlers: any) => ({
      moveProps: {
        onMoveStart: () => handlers.onMoveStart?.(),
        onMove: (e: any) => handlers.onMove?.(e),
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
              preventDefault() {},
              shiftKey: shift,
            } as any);
          });
          expect(size).toBeGreaterThanOrEqual(32);
          expect(size).toBeLessThanOrEqual(256);

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
        preventDefault() {},
        shiftKey: false,
      } as any);
    });
    expect(size).toBeGreaterThanOrEqual(32);
    const afterUp = size;
    act(() => {
      result.current.onKeyDown({
        key: "ArrowDown",
        preventDefault() {},
        shiftKey: false,
      } as any);
    });
    expect(size).toBeLessThanOrEqual(afterUp);
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
            (result.current as any).onMoveStart?.();
          });

          act(() => {
            for (const m of moves)
              (result.current as any).onMove?.({
                deltaX: m.dx,
                deltaY: m.dy,
              } as any);
          });

          act(() => {
            (result.current as any).onMoveEnd?.();
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
      (result.current as any).onMoveStart?.();
      (result.current as any).onMove?.({ deltaX: 5, deltaY: 2 } as any);
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
      return 1 as any;
    });
    vi.stubGlobal("cancelAnimationFrame", (_: number) => 0 as any);

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
});

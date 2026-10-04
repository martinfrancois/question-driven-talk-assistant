import { afterEach, describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { renderHook, act } from "@testing-library/react";
import {
  clampQrSize,
  computeResizeDelta,
  MAX_QR_CODE_SIZE,
  MIN_QR_CODE_SIZE,
  QR_RESIZE_STEP,
  QR_RESIZE_STEP_LARGE,
  type ResizeDirection,
} from "@/lib/qr.ts";
import { useResizeHandleProps } from "./use-resize-handle-props.ts";

vi.mock("@react-aria/interactions", () => {
  interface Handlers {
    onMoveStart?: () => void;
    onMove?: (e: { deltaX: number; deltaY: number }) => void;
    onMoveEnd?: () => void;
  }
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

interface DragHandlers {
  onMoveStart: () => void;
  onMove: (e: { deltaX: number; deltaY: number }) => void;
  onMoveEnd: () => void;
}

type HandleProps = ReturnType<typeof useResizeHandleProps>;
type ResizeKeyEvent = Parameters<HandleProps["onKeyDown"]>[0];

// The useMove mock above spreads these handlers into the returned props.
const dragHandlers = (props: HandleProps): DragHandlers =>
  props as unknown as DragHandlers;

const keyEvent = (key: string, shiftKey = false): ResizeKeyEvent => ({
  key,
  shiftKey,
  ctrlKey: false,
  altKey: false,
  preventDefault: vi.fn(),
});

// Keeps the frame pending so only flush() or unmount can settle it.
function stubPendingAnimationFrame(id: number) {
  const raf = vi.fn<(cb: FrameRequestCallback) => number>().mockReturnValue(id);
  const caf = vi.fn<(id: number) => void>();
  vi.stubGlobal("requestAnimationFrame", raf);
  vi.stubGlobal("cancelAnimationFrame", caf);
  return { raf, caf };
}

const GROWING_KEYS = ["ArrowRight", "ArrowUp"];
const SHRINKING_KEYS = ["ArrowLeft", "ArrowDown"];

function expectedKeyboardSize(
  size: number | undefined,
  key: string,
  shift: boolean,
): number {
  const step = shift ? QR_RESIZE_STEP_LARGE : QR_RESIZE_STEP;
  const sign = GROWING_KEYS.includes(key) ? 1 : -1;
  return clampQrSize((size ?? MIN_QR_CODE_SIZE) + sign * step);
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.style.userSelect = "";
});

describe("useResizeHandleProps (properties)", () => {
  it("arrow keys change the size by the step and clamp it", () => {
    fc.assert(
      fc.property(
        fc.option(fc.integer({ min: 0, max: MAX_QR_CODE_SIZE + 50 }), {
          nil: undefined,
        }),
        fc.constantFrom(...GROWING_KEYS, ...SHRINKING_KEYS),
        fc.boolean(),
        (size, key, shift) => {
          const setSize = vi.fn<(n: number) => void>();
          const { result, unmount } = renderHook(() =>
            useResizeHandleProps(
              "bottom-right",
              "label",
              size,
              setSize,
              vi.fn(),
            ),
          );
          const e = keyEvent(key, shift);

          act(() => result.current.onKeyDown(e));

          expect(e.preventDefault).toHaveBeenCalledOnce();
          expect(setSize).toHaveBeenCalledExactlyOnceWith(
            expectedKeyboardSize(size, key, shift),
          );
          unmount();
        },
      ),
    );
  });

  it("each key press starts from the size the previous one committed", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: MAX_QR_CODE_SIZE + 50 }),
        fc.array(
          fc.record({
            key: fc.constantFrom(...GROWING_KEYS, ...SHRINKING_KEYS),
            shift: fc.boolean(),
          }),
          { minLength: 1, maxLength: 20 },
        ),
        (initialSize, presses) => {
          let size = initialSize;
          const setSize = (n: number) => {
            size = n;
          };
          const { result, rerender, unmount } = renderHook(
            ({ current }: { current: number }) =>
              useResizeHandleProps(
                "bottom-right",
                "label",
                current,
                setSize,
                vi.fn(),
              ),
            { initialProps: { current: size } },
          );

          let expected = initialSize;
          for (const { key, shift } of presses) {
            act(() => result.current.onKeyDown(keyEvent(key, shift)));
            rerender({ current: size });
            expected = expectedKeyboardSize(expected, key, shift);
          }

          expect(size).toBe(expected);
          unmount();
        },
      ),
    );
  });

  it("ignores keys other than the arrows", () => {
    fc.assert(
      fc.property(
        fc
          .string()
          .filter((k) => ![...GROWING_KEYS, ...SHRINKING_KEYS].includes(k)),
        (key) => {
          const setSize = vi.fn<(n: number) => void>();
          const { result, unmount } = renderHook(() =>
            useResizeHandleProps(
              "bottom-right",
              "label",
              100,
              setSize,
              vi.fn(),
            ),
          );
          const e = keyEvent(key);

          act(() => result.current.onKeyDown(e));

          expect(e.preventDefault).not.toHaveBeenCalled();
          expect(setSize).not.toHaveBeenCalled();
          unmount();
        },
      ),
    );
  });

  it("a drag commits the clamped size of the summed pointer deltas on end", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: MIN_QR_CODE_SIZE, max: MAX_QR_CODE_SIZE }),
        fc.constantFrom<ResizeDirection>("bottom-right", "bottom-left"),
        fc.array(
          fc.record({
            deltaX: fc.integer({ min: -100, max: 100 }),
            deltaY: fc.integer({ min: -100, max: 100 }),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        (initialSize, direction, moves) => {
          stubPendingAnimationFrame(1);
          const setSize = vi.fn<(n: number) => void>();
          const onEnd = vi.fn();
          const { result, unmount } = renderHook(() =>
            useResizeHandleProps(
              direction,
              "label",
              initialSize,
              setSize,
              onEnd,
            ),
          );
          const drag = dragHandlers(result.current);

          act(() => {
            drag.onMoveStart();
            for (const move of moves) drag.onMove(move);
            drag.onMoveEnd();
          });

          const totalX = moves.reduce((sum, m) => sum + m.deltaX, 0);
          const totalY = moves.reduce((sum, m) => sum + m.deltaY, 0);
          const expected = clampQrSize(
            initialSize + computeResizeDelta(direction, totalX, totalY),
          );
          expect(setSize).toHaveBeenLastCalledWith(expected);
          expect(onEnd).toHaveBeenCalledOnce();
          unmount();
        },
      ),
    );
  });

  it("schedules one animation frame for many moves until flushed", () => {
    const { raf, caf } = stubPendingAnimationFrame(9);
    const setSize = vi.fn<(n: number) => void>();
    const { result, unmount } = renderHook(() =>
      useResizeHandleProps("bottom-right", "label", 100, setSize, vi.fn()),
    );
    const drag = dragHandlers(result.current);

    act(() => {
      drag.onMoveStart();
      for (let i = 0; i < 5; i++) drag.onMove({ deltaX: 2, deltaY: 1 });
    });
    expect(raf).toHaveBeenCalledOnce();
    expect(setSize).not.toHaveBeenCalled();

    act(() => drag.onMoveEnd());
    expect(caf).toHaveBeenCalledWith(9);
    expect(setSize).toHaveBeenCalledExactlyOnceWith(110);
    unmount();
  });

  it("the animation frame commits the pending size during a drag", () => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(performance.now());
      return 1;
    });
    const setSize = vi.fn<(n: number) => void>();
    const { result, unmount } = renderHook(() =>
      useResizeHandleProps("bottom-right", "label", 100, setSize, vi.fn()),
    );
    const drag = dragHandlers(result.current);

    act(() => {
      drag.onMoveStart();
      drag.onMove({ deltaX: 3, deltaY: 1 });
    });

    expect(setSize).toHaveBeenCalledExactlyOnceWith(103);
    unmount();
  });

  it("starts a drag from the minimum size when the size is 0", () => {
    stubPendingAnimationFrame(1);
    const setSize = vi.fn<(n: number) => void>();
    const { result, unmount } = renderHook(() =>
      useResizeHandleProps("bottom-right", "label", 0, setSize, vi.fn()),
    );
    const drag = dragHandlers(result.current);

    act(() => {
      drag.onMoveStart();
      drag.onMove({ deltaX: 10, deltaY: 0 });
      drag.onMoveEnd();
    });

    expect(setSize).toHaveBeenLastCalledWith(MIN_QR_CODE_SIZE + 10);
    unmount();
  });

  it("disables text selection during a drag and restores it on end", () => {
    document.body.style.userSelect = "auto";
    const { result, unmount } = renderHook(() =>
      useResizeHandleProps("bottom-right", "label", 100, vi.fn(), vi.fn()),
    );
    const drag = dragHandlers(result.current);

    act(() => drag.onMoveStart());
    expect(document.body.style.userSelect).toBe("none");

    act(() => drag.onMoveEnd());
    expect(document.body.style.userSelect).toBe("auto");
    unmount();
  });

  it("unmounting mid-drag cancels the pending frame and restores text selection", () => {
    const { caf } = stubPendingAnimationFrame(7);
    document.body.style.userSelect = "auto";
    const setSize = vi.fn<(n: number) => void>();
    const onEnd = vi.fn();
    const { result, unmount } = renderHook(() =>
      useResizeHandleProps("bottom-right", "label", 100, setSize, onEnd),
    );
    const drag = dragHandlers(result.current);

    act(() => {
      drag.onMoveStart();
      drag.onMove({ deltaX: 5, deltaY: 2 });
    });
    unmount();

    expect(caf).toHaveBeenCalledExactlyOnceWith(7);
    expect(document.body.style.userSelect).toBe("auto");
    expect(setSize).not.toHaveBeenCalled();
    expect(onEnd).not.toHaveBeenCalled();
  });

  it("unmounting outside a drag leaves text selection alone", () => {
    document.body.style.userSelect = "text";
    const { unmount } = renderHook(() =>
      useResizeHandleProps("bottom-right", "label", 100, vi.fn(), vi.fn()),
    );

    unmount();

    expect(document.body.style.userSelect).toBe("text");
  });
});

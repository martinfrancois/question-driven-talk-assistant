import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { useMove } from "@react-aria/interactions";
import type { MoveMoveEvent } from "@react-aria/interactions";

import {
  clampQrSize,
  computeResizeDelta,
  MIN_QR_CODE_SIZE,
  MAX_QR_CODE_SIZE,
  QR_RESIZE_STEP,
  QR_RESIZE_STEP_LARGE,
  type ResizeDirection as Direction,
} from "@/lib/qr.ts";

export function useResizeHandleProps(
  direction: Direction,
  label: string,
  size: number,
  setSize: (n: number) => void,
  onResizeEnd: () => void,
) {
  /**
   * These refs keep track of the base size, accumulated pointer deltas, and
   * pending size updates while dragging the resize handle.
   */
  const baseSize = useRef<number>(size);
  const sumX = useRef(0);
  const sumY = useRef(0);
  const pending = useRef<number>(size);
  const rafId = useRef<number | null>(null);
  const prevUserSelect = useRef<string>("");
  const dragging = useRef(false);

  // Batch size updates with rAF to limit layout thrashing while dragging
  const schedule = (): void => {
    if (rafId.current != null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      setSize(Math.round(pending.current));
    });
  };

  // Flush a pending update (used at the end of the drag)
  const flush = (): void => {
    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
      setSize(Math.round(pending.current));
    }
  };

  const restoreUserSelect = (): void => {
    dragging.current = false;
    const doc = globalThis.document;
    /* istanbul ignore else: document only goes missing outside a browser, where these tests never run */
    if (doc) doc.body.style.userSelect = prevUserSelect.current;
  };

  const { moveProps } = useMove({
    onMoveStart(): void {
      // Initialize drag state and temporarily disable text selection during drag
      baseSize.current = Number(size) || MIN_QR_CODE_SIZE;
      sumX.current = 0;
      sumY.current = 0;
      dragging.current = true;
      const doc = globalThis.document;
      /* istanbul ignore else: document only goes missing outside a browser, where these tests never run */
      if (doc) {
        prevUserSelect.current = doc.body.style.userSelect;
        doc.body.style.userSelect = "none";
      }
    },
    onMove(e: MoveMoveEvent): void {
      sumX.current += e.deltaX;
      sumY.current += e.deltaY;
      const delta = computeResizeDelta(direction, sumX.current, sumY.current);
      pending.current = clampQrSize(baseSize.current + delta);
      schedule();
    },
    onMoveEnd(): void {
      restoreUserSelect();
      flush();
      onResizeEnd();
    },
  });

  useEffect(() => {
    return () => {
      // Unmounting mid-drag skips onMoveEnd, which would leave the frame
      // pending and the whole page unselectable.
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
      if (dragging.current) restoreUserSelect();
    };
  }, []);

  type ResizeKeyEvent = Pick<
    KeyboardEvent<HTMLButtonElement>,
    "key" | "shiftKey" | "preventDefault"
  >;
  const onKeyDown = (e: ResizeKeyEvent): void => {
    const step = e.shiftKey ? QR_RESIZE_STEP_LARGE : QR_RESIZE_STEP;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setSize(clampQrSize(size + step));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setSize(clampQrSize(size - step));
    }
  };

  return {
    ...moveProps,
    role: "slider",
    tabIndex: 0,
    "aria-label": label,
    "aria-valuemin": MIN_QR_CODE_SIZE,
    "aria-valuemax": MAX_QR_CODE_SIZE,
    "aria-valuenow": size,
    "aria-valuetext": `${size}px`,
    onKeyDown,
  } as const;
}

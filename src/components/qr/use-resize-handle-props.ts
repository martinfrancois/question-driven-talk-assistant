import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { useMove } from "@react-aria/interactions";
import type { MoveMoveEvent } from "@react-aria/interactions";

import {
  clampQrSize,
  computeResizeDelta,
  MIN_QR_CODE_SIZE,
  MAX_QR_CODE_SIZE,
  type ResizeDirection as Direction,
} from "@/lib/qr.ts";

export function useResizeHandleProps(
  direction: Direction,
  label: string,
  size: number | undefined,
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

  const { moveProps } = useMove({
    onMoveStart(): void {
      // Initialize drag state and temporarily disable text selection during drag
      baseSize.current = Number(size) || MIN_QR_CODE_SIZE;
      sumX.current = 0;
      sumY.current = 0;
      const doc = globalThis.document;
      /* istanbul ignore if: exercising missing document reliably in browser env is flaky */
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
      const doc = globalThis.document;
      /* istanbul ignore if: exercising missing document reliably in browser env is flaky */
      if (doc) doc.body.style.userSelect = prevUserSelect.current;
      flush();
      onResizeEnd();
    },
  });

  useEffect(() => {
    return () => {
      // Ensure any pending rAF is cancelled if the component unmounts mid-drag
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  type ResizeKeyEvent = Pick<
    KeyboardEvent<HTMLButtonElement>,
    "key" | "shiftKey" | "ctrlKey" | "altKey" | "preventDefault"
  >;
  const onKeyDown = (e: ResizeKeyEvent): void => {
    const step = e.shiftKey ? 16 : 4;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setSize(clampQrSize((size ?? MIN_QR_CODE_SIZE) + step));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setSize(clampQrSize((size ?? MIN_QR_CODE_SIZE) - step));
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

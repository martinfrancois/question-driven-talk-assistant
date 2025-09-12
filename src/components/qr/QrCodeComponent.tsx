import { useRef, useCallback, useEffect } from "react";
import type { JSX, KeyboardEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useMove } from "@react-aria/interactions";
import type {
  MoveStartEvent,
  MoveMoveEvent,
  MoveEndEvent,
} from "@react-aria/interactions";
import { useHotkeys } from "react-hotkeys-hook";
import {
  useQrCodeUrl,
  useSetQrCodeUrl,
  useQrCodeSize,
  useSetQrCodeSize,
} from "@/stores";

type Direction = "bottom-right" | "bottom-left";

const MIN_QR_CODE_SIZE = 32;
const MAX_QR_CODE_SIZE = 256;

function clamp(n: number): number {
  return Math.min(Math.max(n, MIN_QR_CODE_SIZE), MAX_QR_CODE_SIZE);
}

function useResizeHandleProps(
  direction: Direction,
  label: string,
  size: number,
  setSize: (n: number) => void,
  onResizeEnd: () => void,
) {
  const baseSize = useRef<number>(size);
  const sumX = useRef(0);
  const sumY = useRef(0);
  const pending = useRef<number>(size);
  const rafId = useRef<number | null>(null);
  const prevUserSelect = useRef<string>("");

  const schedule = (): void => {
    if (rafId.current != null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      setSize(Math.round(pending.current));
    });
  };

  const flush = (): void => {
    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
      setSize(Math.round(pending.current));
    }
  };

  const { moveProps } = useMove({
    onMoveStart(_: MoveStartEvent): void {
      baseSize.current = Number(size) || MIN_QR_CODE_SIZE;
      sumX.current = 0;
      sumY.current = 0;
      const doc = globalThis.document;
      if (doc) {
        prevUserSelect.current = doc.body.style.userSelect;
        doc.body.style.userSelect = "none";
      }
    },
    onMove(e: MoveMoveEvent): void {
      sumX.current += e.deltaX;
      sumY.current += e.deltaY;
      const delta =
        direction === "bottom-right"
          ? Math.max(sumX.current, sumY.current)
          : Math.max(-sumX.current, sumY.current);
      pending.current = clamp(baseSize.current + delta);
      schedule();
    },
    onMoveEnd(_: MoveEndEvent): void {
      const doc = globalThis.document;
      if (doc) doc.body.style.userSelect = prevUserSelect.current;
      flush();
      onResizeEnd();
    },
  });

  useEffect(() => {
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>): void => {
    const step = e.shiftKey ? 16 : 4;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setSize(clamp((size ?? MIN_QR_CODE_SIZE) + step));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setSize(clamp((size ?? MIN_QR_CODE_SIZE) - step));
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

export default function QrCodeComponent(): JSX.Element {
  const url = useQrCodeUrl() ?? "";
  const setUrl = useSetQrCodeUrl();
  const size = useQrCodeSize();
  const setSize = useSetQrCodeSize();

  const preventClick = useRef(false);
  const afterResize = useCallback(() => {
    preventClick.current = true;
    setTimeout(() => (preventClick.current = false), 200);
  }, []);

  const handleClick = useCallback(() => {
    if (preventClick.current) return;
    const newURL = prompt("Enter QR Code URL", url);
    if (newURL !== null) setUrl(newURL);
  }, [url, setUrl]);

  useHotkeys("ctrl+shift+q", handleClick, { enableOnFormTags: true }, [
    handleClick,
  ]);

  const brHandleProps = useResizeHandleProps(
    "bottom-right",
    "Resize bottom right",
    size,
    setSize,
    afterResize,
  );
  const blHandleProps = useResizeHandleProps(
    "bottom-left",
    "Resize bottom left",
    size,
    setSize,
    afterResize,
  );

  const onWrapperKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={onWrapperKeyDown}
      aria-label={
        url
          ? "QR Code. Click to change the URL"
          : "No QR Code set. Click to enter a URL"
      }
      aria-keyshortcuts="Control+Q to show the QR code full screen, Control+Shift+Q to edit QR code URL"
      className="group relative inline-block cursor-pointer"
      data-testid="qr-code"
    >
      <div
        className={`rounded-md border border-white !bg-white p-2 ${
          url ? "" : "invisible group-hover:visible"
        }`}
        role="presentation"
      >
        {url ? (
          <QRCodeSVG
            value={url}
            size={size}
            data-testid="qr-code-svg"
            role="presentation"
          />
        ) : (
          <div className="text-neutral-400" data-testid="qr-code-placeholder">
            QR
          </div>
        )}
      </div>

      {url && (
        <>
          <button
            type="button"
            className="absolute right-0 bottom-0 z-10 h-7 w-7 translate-x-[8px] translate-y-[8px] cursor-se-resize touch-none rounded bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            data-testid="qr-code-resize-bottom-right"
            {...brHandleProps}
          />
          <button
            type="button"
            className="absolute bottom-0 left-0 z-10 h-7 w-7 -translate-x-[8px] translate-y-[8px] cursor-sw-resize touch-none rounded bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            data-testid="qr-code-resize-bottom-left"
            {...blHandleProps}
          />
        </>
      )}
    </div>
  );
}

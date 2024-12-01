import React, { FC, useCallback, useRef } from "react";
import {
  useQrCodeSize,
  useQrCodeUrl,
  useSetQrCodeSize,
  useSetQrCodeUrl,
} from "../../stores";
import { QRCodeSVG } from "qrcode.react";
import { useHotkeys } from "react-hotkeys-hook";

const QrCodeComponent: FC = () => {
  const qrCodeUrl = useQrCodeUrl();
  const setQrCodeUrl = useSetQrCodeUrl();
  const qrCodeSize = useQrCodeSize();
  const setQrCodeSize = useSetQrCodeSize();

  const isResizing = useRef(false); // Tracks if resizing is in progress
  const preventClick = useRef(false); // Temporarily prevents click after resize
  const resizeDirection = useRef<"bottom-right" | "bottom-left">(
    "bottom-right",
  ); // Tracks the resize handle direction

  const handleResizeStart = (
    e: React.PointerEvent,
    direction: "bottom-right" | "bottom-left",
  ) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent the click from propagating

    isResizing.current = true;
    preventClick.current = false;
    resizeDirection.current = direction;

    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = qrCodeSize;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Adjust size based on the handle being dragged
      const delta =
        resizeDirection.current === "bottom-right"
          ? Math.max(deltaX, deltaY)
          : Math.max(-deltaX, deltaY);

      setQrCodeSize(Math.min(Math.max(startSize + delta, 32), 256));
    };

    const onPointerUp = () => {
      isResizing.current = false;
      preventClick.current = true;
      setTimeout(() => {
        preventClick.current = false;
      }, 200);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  };

  const handleClick = useCallback(() => {
    if (preventClick.current) {
      // Ignore this click as it follows a resize action
      return;
    }
    const newURL = prompt("Enter QR Code URL", qrCodeUrl);
    if (newURL !== null) setQrCodeUrl(newURL);
  }, [qrCodeUrl, setQrCodeUrl]);

  useHotkeys("ctrl+shift+q", handleClick, { enableOnFormTags: true }, [
    handleClick,
  ]);

  return (
    <button
      onClick={handleClick}
      aria-label={
        qrCodeUrl
          ? "QR Code. Click to change the URL"
          : "No QR Code set. Click to enter a URL"
      }
      className="group relative cursor-pointer"
      aria-keyshortcuts="Control+q to show the qr code full screen, Control+Shift+Q to edit QR code URL"
      data-testid="qr-code"
    >
      <div
        className={`rounded-md border border-white !bg-white p-2 ${
          qrCodeUrl ? "" : "invisible group-hover:visible"
        }`}
        role="presentation"
      >
        {qrCodeUrl ? (
          <QRCodeSVG
            value={qrCodeUrl}
            size={qrCodeSize}
            data-testid="qr-code-svg"
            role="presentation"
          />
        ) : (
          <div className="text-neutral-400" data-testid="qr-code-placeholder">
            QR
          </div>
        )}
      </div>
      {qrCodeUrl && (
        <>
          <span
            onPointerDown={(e) => handleResizeStart(e, "bottom-right")}
            className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize focus:outline-none"
            data-testid="qr-code-resize-bottom-right"
            aria-hidden={true} // can't be resized with assistive technologies
            tabIndex={-1}
          />
          <span
            onPointerDown={(e) => handleResizeStart(e, "bottom-left")}
            className="absolute bottom-0 left-0 h-4 w-4 cursor-sw-resize focus:outline-none"
            data-testid="qr-code-resize-bottom-left"
            aria-hidden={true} // can't be resized with assistive technologies
            tabIndex={-1}
          />
        </>
      )}
    </button>
  );
};

export default QrCodeComponent;

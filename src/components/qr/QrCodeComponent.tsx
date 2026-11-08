import { useCallback } from "react";
import type { JSX, KeyboardEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  useQrCodeUrl,
  useSetQrCodeUrl,
  useQrCodeSize,
  useSetQrCodeSize,
} from "@/stores";

import { useResizeHandleProps } from "./use-resize-handle-props.ts";

export default function QrCodeComponent(): JSX.Element {
  const url = useQrCodeUrl() ?? "";
  const setUrl = useSetQrCodeUrl();
  const size = useQrCodeSize();
  const setSize = useSetQrCodeSize();

  const handleClick = useCallback(() => {
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
  );
  const blHandleProps = useResizeHandleProps(
    "bottom-left",
    "Resize bottom left",
    size,
    setSize,
  );

  const onUrlButtonKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  // The resize handles sit next to the URL button, not inside it: a slider
  // nested in a button is an invalid nested control, and their clicks and
  // keys would bubble up and open the URL prompt.
  return (
    <div className="group relative inline-block">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={onUrlButtonKeyDown}
        aria-label={
          url
            ? "QR Code. Click to change the URL"
            : "No QR Code set. Click to enter a URL"
        }
        aria-keyshortcuts="Control+Q to show the QR code full screen, Control+Shift+Q to edit QR code URL"
        className="cursor-pointer"
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
      </div>

      {url && (
        <>
          <div
            className="absolute right-0 bottom-0 z-10 h-7 w-7 translate-x-[8px] translate-y-[8px] cursor-se-resize touch-none rounded bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            data-testid="qr-code-resize-bottom-right"
            {...brHandleProps}
          />
          <div
            className="absolute bottom-0 left-0 z-10 h-7 w-7 -translate-x-[8px] translate-y-[8px] cursor-sw-resize touch-none rounded bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            data-testid="qr-code-resize-bottom-left"
            {...blHandleProps}
          />
        </>
      )}
    </div>
  );
}

import { FC, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeComponentProps {
  qrCodeURL: string;
  setQrCodeURL: (url: string) => void;
  qrCodeSize: number;
  setQrCodeSize: (size: number) => void;
}

const QRCodeComponent: FC<QRCodeComponentProps> = ({
  qrCodeURL,
  setQrCodeURL,
  qrCodeSize,
  setQrCodeSize,
}) => {
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

  const handleClick = () => {
    if (preventClick.current) {
      // Ignore this click as it follows a resize action
      return;
    }
    const newURL = prompt("Enter QR Code URL", qrCodeURL);
    if (newURL !== null) setQrCodeURL(newURL);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer"
      data-testid="qr-code"
    >
      <div
        className={`rounded-md border border-white !bg-white p-2 ${
          qrCodeURL ? "" : "invisible group-hover:visible"
        }`}
      >
        {qrCodeURL ? (
          <QRCodeSVG
            value={qrCodeURL}
            size={qrCodeSize}
            data-testid="qr-code-svg"
          />
        ) : (
          <div className="text-gray-400" data-testid="qr-code-placeholder">
            QR
          </div>
        )}
      </div>
      {qrCodeURL && (
        <>
          <div
            className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
            onPointerDown={(e) => handleResizeStart(e, "bottom-right")}
            data-testid="qr-code-resize-bottom-right"
          />
          <div
            className="absolute bottom-0 left-0 h-4 w-4 cursor-sw-resize"
            onPointerDown={(e) => handleResizeStart(e, "bottom-left")}
            data-testid="qr-code-resize-bottom-left"
          />
        </>
      )}
    </div>
  );
};

export default QRCodeComponent;

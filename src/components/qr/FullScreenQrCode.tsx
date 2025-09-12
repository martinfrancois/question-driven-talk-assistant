import { useQrCodeUrl } from "@/stores";
import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { QRCodeSVG } from "qrcode.react";

export function FullScreenQrCode() {
  const qrCodeUrl = useQrCodeUrl();
  const [showFullScreenQr, setShowFullScreenQr] = useState(false);

  useHotkeys(
    "ctrl+q",
    () => setShowFullScreenQr((prev) => !prev),
    { enableOnFormTags: true },
    [setShowFullScreenQr],
  );

  const hideFullScreenQrCode = useCallback(
    () => setShowFullScreenQr(false),
    [setShowFullScreenQr],
  );

  if (!(showFullScreenQr && qrCodeUrl)) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
      onClick={hideFullScreenQrCode}
      data-testid="fullscreen-qr-code"
      aria-modal
      aria-label={"Full Screen QR Code"}
      aria-keyshortcuts="Control+q to hide full screen qr code"
      role="dialog"
    >
      <div className="rounded-lg !bg-white p-8" aria-hidden>
        <QRCodeSVG
          aria-hidden
          value={qrCodeUrl}
          size={128}
          className="block h-[70vmin] w-[70vmin]"
        />
      </div>
    </div>
  );
}

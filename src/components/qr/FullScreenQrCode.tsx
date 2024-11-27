import { useQrCodeUrl } from "../../stores";
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
    [setShowFullScreenQr]
  );

  const hideFullScreenQrCode = useCallback(
    () => setShowFullScreenQr(false),
    [setShowFullScreenQr]
  );

  if (!(showFullScreenQr && qrCodeUrl)) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={hideFullScreenQrCode}
      data-testid="fullscreen-qr-code"
    >
      <div className="rounded-lg !bg-white p-8">
        <QRCodeSVG value={qrCodeUrl} size={window.innerHeight * 0.7} />
      </div>
    </div>
  );
}
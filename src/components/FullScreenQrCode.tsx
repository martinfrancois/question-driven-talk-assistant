import {QRCodeSVG} from "qrcode.react";

export function FullScreenQrCode(props: { onClick: () => void, value: string }) {
    return <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        onClick={props.onClick}
        data-testid="fullscreen-qr-code"
    >
        {/* Container for white padding around QR code */}
        <div className="rounded-lg !bg-white p-8">
            <QRCodeSVG value={props.value} size={window.innerHeight * 0.7}/>
        </div>
    </div>;
}
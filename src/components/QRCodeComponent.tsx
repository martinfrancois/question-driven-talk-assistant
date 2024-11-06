import { FC, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeComponentProps {
    qrCodeURL: string;
    setQrCodeURL: (url: string) => void;
}

const QRCodeComponent: FC<QRCodeComponentProps> = ({ qrCodeURL, setQrCodeURL }) => {
    const [size, setSize] = useState(64);
    const isResizing = useRef(false); // Tracks if resizing is in progress
    const preventClick = useRef(false); // Temporarily prevents click after resize
    const resizeDirection = useRef<'bottom-right' | 'bottom-left'>('bottom-right'); // Tracks the resize handle direction

    const handleResizeStart = (e: React.PointerEvent, direction: 'bottom-right' | 'bottom-left') => {
        e.preventDefault();
        e.stopPropagation(); // Prevent the click from propagating

        isResizing.current = true;
        preventClick.current = false;
        resizeDirection.current = direction;

        const startX = e.clientX;
        const startY = e.clientY;
        const startSize = size;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            // Adjust size based on the handle being dragged
            const delta = resizeDirection.current === 'bottom-right'
                ? Math.max(deltaX, deltaY)
                : Math.max(-deltaX, deltaY);

            setSize(Math.min(Math.max(startSize + delta, 32), 256));
        };

        const onPointerUp = () => {
            isResizing.current = false;
            preventClick.current = true;
            setTimeout(() => {
                preventClick.current = false;
            }, 200);
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
        };

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    };

    const handleClick = () => {
        if (preventClick.current) {
            // Ignore this click as it follows a resize action
            return;
        }
        const newURL = prompt('Enter QR Code URL', qrCodeURL);
        if (newURL !== null) setQrCodeURL(newURL);
    };

    return (
        <div
            onClick={handleClick}
            className="group cursor-pointer relative"
        >
            <div
                className={`p-2 border border-white rounded-md !bg-white ${
                    qrCodeURL ? '' : 'invisible group-hover:visible'
                }`}
            >
                {qrCodeURL ? (
                    <QRCodeSVG value={qrCodeURL} size={size} />
                ) : (
                    <div className="text-gray-400">QR</div>
                )}
            </div>
            {/* Resizable Handles */}
            {qrCodeURL && (
                <>
                    <div
                        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                        onPointerDown={(e) => handleResizeStart(e, 'bottom-right')}
                    />
                    <div
                        className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
                        onPointerDown={(e) => handleResizeStart(e, 'bottom-left')}
                    />
                </>
            )}
        </div>
    );
};

export default QRCodeComponent;
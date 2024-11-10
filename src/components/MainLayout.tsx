import { FC } from 'react';
import QuestionList from './QuestionList';
import TimeDisplay from './TimeDisplay';
import QRCodeComponent from './QRCodeComponent';
import { QRCodeSVG } from 'qrcode.react';
import {Question} from "./QuestionItem.tsx";

interface MainLayoutProps {
    title: string;
    setTitle: (title: string) => void;
    footer: string;
    setFooter: (footer: string) => void;
    timeFormat24h: boolean;
    setTimeFormat24h: (format: boolean) => void;
    questions: Question[];
    updateQuestions: (updateFunc: (draft: Question[]) => void) => void;
    qrCodeURL: string;
    setQrCodeURL: (url: string) => void;
    qrCodeSize: number;
    setQrCodeSize: (size: number) => void;
    isDarkMode: boolean;
    showFullScreenQR: boolean;
    setShowFullScreenQR: (show: boolean) => void;
}

const MainLayout: FC<MainLayoutProps> = ({
                                             title,
                                             setTitle,
                                             footer,
                                             setFooter,
                                             timeFormat24h,
                                             setTimeFormat24h,
                                             questions,
                                             updateQuestions,
                                             qrCodeURL,
                                             setQrCodeURL,
                                             qrCodeSize,
                                             setQrCodeSize,
                                             isDarkMode,
                                             showFullScreenQR,
                                             setShowFullScreenQR,
                                         }) => {
    return (
        <div
            className={`p-4 h-screen w-screen flex flex-col ${
                isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
            } ${
                isDarkMode ? 'dark' : 'light'
            }`}
            data-testid="main-layout-container"
        >
            {/* Header */}
            <div className="flex items-center flex-shrink-0">
                <div className="flex-grow">
                    <div
                        onClick={() => {
                            const newTitle = prompt('Edit Title', title);
                            if (newTitle !== null) setTitle(newTitle);
                        }}
                        className="text-3xl font-semibold cursor-pointer"
                        data-testid="main-header"
                    >
                        {title}
                    </div>
                </div>
                <div className="text-right pr-2">
                    <TimeDisplay
                        format24h={timeFormat24h}
                        toggleFormat={() => setTimeFormat24h(!timeFormat24h)}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="mt-4 flex flex-1 overflow-hidden">
                {/* Question List Area with scrolling */}
                <div className="pr-2 flex-grow scrollbar-minimal overflow-y-auto" style={{ maxHeight: '100%' }}>
                    <QuestionList questions={questions} updateQuestions={updateQuestions} />
                </div>

                {/* Side Area (QR Code) - Fixed within the main content */}
                <div className="ml-4 flex-shrink-0 self-start">
                    <QRCodeComponent qrCodeURL={qrCodeURL} setQrCodeURL={setQrCodeURL} qrCodeSize={qrCodeSize} setQrCodeSize={setQrCodeSize} />
                </div>
            </div>

            {/* Footer */}
            <div
                onClick={() => {
                    const newFooter = prompt('Edit Footer', footer);
                    if (newFooter !== null) setFooter(newFooter);
                }}
                className="text-xl text-center cursor-pointer p-2 flex-shrink-0"
                data-testid="main-footer"
            >
                {footer}
            </div>

            {showFullScreenQR && qrCodeURL && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={() => setShowFullScreenQR(false)}
                    data-testid="fullscreen-qr-code"
                >
                    {/* Container for white padding around QR code */}
                    <div className="!bg-white p-8 rounded-lg">
                        <QRCodeSVG value={qrCodeURL} size={window.innerHeight * 0.7} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainLayout;

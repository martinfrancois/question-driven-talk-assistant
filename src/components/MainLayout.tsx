import { FC } from 'react';
import QuestionList from './QuestionList';
import TimeDisplay from './TimeDisplay';
import QRCodeComponent from './QRCodeComponent';
import { QRCodeSVG } from 'qrcode.react';

interface MainLayoutProps {
    title: string;
    setTitle: (title: string) => void;
    footer: string;
    setFooter: (footer: string) => void;
    timeFormat24h: boolean;
    setTimeFormat24h: (format: boolean) => void;
    questions: any[];
    updateQuestions: (updateFunc: (draft: any[]) => void) => void;
    qrCodeURL: string;
    setQrCodeURL: (url: string) => void;
    fontSize: number;
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
                                             fontSize,
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
            style={{ fontSize }}
        >
            {/* Header */}
            <div className="flex items-center flex-shrink-0">
                <div className="flex-grow">
                    <div
                        onClick={() => {
                            const newTitle = prompt('Edit Title', title);
                            if (newTitle !== null) setTitle(newTitle);
                        }}
                        className="text-2xl font-semibold cursor-pointer"
                    >
                        {title}
                    </div>
                </div>
                <div className="text-right">
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
                    <QRCodeComponent qrCodeURL={qrCodeURL} setQrCodeURL={setQrCodeURL} />
                </div>
            </div>

            {/* Footer */}
            <div
                onClick={() => {
                    const newFooter = prompt('Edit Footer', footer);
                    if (newFooter !== null) setFooter(newFooter);
                }}
                className="text-sm text-center cursor-pointer p-2 flex-shrink-0"
            >
                {footer}
            </div>

            {showFullScreenQR && qrCodeURL && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={() => setShowFullScreenQR(false)}
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

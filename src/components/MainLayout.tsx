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
            }`}
            style={{ fontSize }}
        >
            {/* Header */}
            <div className="flex items-center">
                {/* Left Section: Title */}
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
                {/* Center Section: Time Display */}
                <div className="text-right">
                    <TimeDisplay
                        format24h={timeFormat24h}
                        toggleFormat={() => setTimeFormat24h(!timeFormat24h)}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="mt-4 flex flex-1 overflow-hidden items-start">
                {/* Question List Area */}
                <div className="pr-4 overflow-y-auto flex-grow">
                    <QuestionList questions={questions} updateQuestions={updateQuestions} />
                </div>

                {/* Side Area (QR Code) */}
                <div className="flex-shrink-0 self-start">
                    <QRCodeComponent qrCodeURL={qrCodeURL} setQrCodeURL={setQrCodeURL} />
                </div>
            </div>

            {/* Footer */}
            <div
                onClick={() => {
                    const newFooter = prompt('Edit Footer', footer);
                    if (newFooter !== null) setFooter(newFooter);
                }}
                className="text-sm text-center cursor-pointer p-2"
            >
                {footer}
            </div>

            {/* Fullscreen QR Code */}
            {showFullScreenQR && qrCodeURL && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={() => setShowFullScreenQR(false)}
                >
                    <QRCodeSVG value={qrCodeURL} size={window.innerHeight * 0.8} />
                </div>
            )}
        </div>
    );
};

export default MainLayout;

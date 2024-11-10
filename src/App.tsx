import React, { useState, useEffect, useCallback } from 'react';
import { produce } from 'immer';
import MainLayout from './components/MainLayout';
import { useHotkeys } from 'react-hotkeys-hook';
import PWABadge from "./PWABadge.tsx";
import Modal from "./components/Modal.tsx";

interface Question {
    id: string;
    text: string;
    answered: boolean;
    highlighted: boolean;
}

const App: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>(() => {
        const storedQuestions = localStorage.getItem('questions');
        return storedQuestions ? JSON.parse(storedQuestions) : [{ id: Date.now().toString(), text: '', answered: false, highlighted: false }];
    });
    const [title, setTitle] = useState(() => localStorage.getItem('title') || 'Ask me anything');
    const [footer, setFooter] = useState(() => localStorage.getItem('footer') || 'FancyCon 2024 | François Martin');
    const [timeFormat24h, setTimeFormat24h] = useState(() => localStorage.getItem('timeFormat24h') === 'true');
    const [qrCodeURL, setQrCodeURL] = useState(() => localStorage.getItem('qrCodeURL') || '');
    const [qrCodeSize, setQrCodeSize] = useState(() => parseFloat(localStorage.getItem('qrCodeSize') || '64'));
    const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('fontSize') || '16'));
    const [key, setKey] = useState(0); // Key to force re-render on font size change
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('isDarkMode') === 'true');
    const [showModal, setShowModal] = useState(false);

    // Persist state to localStorage
    useEffect(() => {
        localStorage.setItem('questions', JSON.stringify(questions));
        localStorage.setItem('title', title);
        localStorage.setItem('footer', footer);
        localStorage.setItem('timeFormat24h', String(timeFormat24h));
        localStorage.setItem('qrCodeURL', qrCodeURL);
        localStorage.setItem('qrCodeSize', qrCodeSize.toString());
        localStorage.setItem('isDarkMode', String(isDarkMode));
    }, [questions, title, footer, timeFormat24h, qrCodeURL, qrCodeSize, isDarkMode]);

    useEffect(() => {
        localStorage.setItem('fontSize', fontSize.toString());
        // TODO is there a better way to do this?
        setKey((prev) => prev + 1); // Update key to force a re-render
    }, [fontSize]);

    // TODO is there a way to use react-hotkeys-hook that doesn't cause it to exit fullscreen mode when pressing ctrl?
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleFullscreenToggle = useCallback(() => {
        import('screenfull').then((screenfull) => {
            if (screenfull.default.isEnabled) {
                if (!isFullscreen) {
                    screenfull.default.request();
                    setIsFullscreen(true);
                } else {
                    screenfull.default.exit();
                    setIsFullscreen(false);
                }
            }
        });
    }, [isFullscreen]);

    // Add event listeners for `Ctrl + f` manually
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'f') {
                event.preventDefault(); // Prevent default browser behavior
                handleFullscreenToggle();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleFullscreenToggle]);

    // Listen for external fullscreen changes (e.g., Esc key exits fullscreen)
    useEffect(() => {
        import('screenfull').then((screenfull) => {
            if (screenfull.default.isEnabled) {
                const handleScreenfullChange = () => {
                    if (!screenfull.default.isFullscreen) {
                        setIsFullscreen(false);
                    }
                };

                screenfull.default.on('change', handleScreenfullChange);
                return () => {
                    screenfull.default.off('change', handleScreenfullChange);
                };
            }
        });
    }, []);

    // Handle keyboard shortcuts
    useHotkeys('ctrl+p', () => setFontSize((size) => size + 2), [setFontSize]);
    useHotkeys('ctrl+m', () => setFontSize((size) => Math.max(12, size - 2)), [setFontSize]);
    useHotkeys('ctrl+shift+backspace', () => setShowModal(true), [setShowModal]);
    useHotkeys('ctrl+d', () => setIsDarkMode((prev) => !prev), [setIsDarkMode]);


    // Fullscreen QR Code
    const [showFullScreenQR, setShowFullScreenQR] = useState(false);
    useHotkeys('ctrl+q', () => setShowFullScreenQR((prev) => !prev), [setShowFullScreenQR]);

    // Update questions using immer
    const updateQuestions = useCallback(
        (updateFunc: (draft: Question[]) => void) => {
            setQuestions(produce(questions, updateFunc));
        },
        [questions]
    );

    return (
        <div data-testid="body" key={key} className={`${isDarkMode ? 'dark' : ''}`} style={{ fontSize: `${fontSize}px` }}>
            <MainLayout
                questions={questions}
                updateQuestions={updateQuestions}
                title={title}
                setTitle={setTitle}
                footer={footer}
                setFooter={setFooter}
                timeFormat24h={timeFormat24h}
                setTimeFormat24h={setTimeFormat24h}
                qrCodeURL={qrCodeURL}
                setQrCodeURL={setQrCodeURL}
                qrCodeSize={qrCodeSize}
                setQrCodeSize={setQrCodeSize}
                isDarkMode={isDarkMode}
                showFullScreenQR={showFullScreenQR}
                setShowFullScreenQR={setShowFullScreenQR}
            />
            {showModal && (
                <Modal
                    title="Confirm Clear"
                    message="Are you sure you want to clear the list?"
                    onConfirm={() => {
                        setQuestions([{ id: Date.now().toString(), text: '', answered: false, highlighted: false }]);
                        setShowModal(false);
                    }}
                    onCancel={() => setShowModal(false)}
                />
            )}
            <PWABadge />
        </div>
    );
};

export default App;

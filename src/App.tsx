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
    const [title, setTitle] = useState(() => localStorage.getItem('title') || 'Q&A Session');
    const [footer, setFooter] = useState(() => localStorage.getItem('footer') || 'This is a footer');
    const [timeFormat24h, setTimeFormat24h] = useState(() => localStorage.getItem('timeFormat24h') === 'true');
    const [qrCodeURL, setQrCodeURL] = useState(() => localStorage.getItem('qrCodeURL') || '');
    const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('fontSize') || '16'));
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('isDarkMode') === 'true');
    const [showModal, setShowModal] = useState(false);

    // Persist state to localStorage
    useEffect(() => {
        localStorage.setItem('questions', JSON.stringify(questions));
        localStorage.setItem('title', title);
        localStorage.setItem('footer', footer);
        localStorage.setItem('timeFormat24h', String(timeFormat24h));
        localStorage.setItem('qrCodeURL', qrCodeURL);
        localStorage.setItem('fontSize', fontSize.toString());
        localStorage.setItem('isDarkMode', String(isDarkMode));
    }, [questions, title, footer, timeFormat24h, qrCodeURL, fontSize, isDarkMode]);

    // Handle keyboard shortcuts
    useHotkeys('ctrl+p', () => setFontSize((size) => size + 1), [setFontSize]);
    useHotkeys('ctrl+m', () => setFontSize((size) => Math.max(12, size - 1)), [setFontSize]);
    useHotkeys('ctrl+shift+backspace', () => setShowModal(true), [setShowModal]);
    useHotkeys('ctrl+d', () => setIsDarkMode((prev) => !prev), [setIsDarkMode]);

    // Fullscreen toggle
    useHotkeys('ctrl+f', () => {
        import('screenfull').then((screenfull) => {
            if (screenfull.default.isEnabled) {
                screenfull.default.toggle();
            }
        });
    });

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
        <div className={`${isDarkMode ? 'dark' : ''}`}>
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
                fontSize={fontSize}
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

import React, { useState, useEffect, useCallback } from "react";
import { produce } from "immer";
import MainLayout from "./components/MainLayout";
import { useHotkeys } from "react-hotkeys-hook";
import PWABadge from "./PWABadge.tsx";
import Modal from "./components/Modal.tsx";
import screenfull from "screenfull";
import {
  generateFileName,
  generateMarkdownContent,
  saveFile,
} from "./save-questions.ts";
import HelpIcon from "./components/HelpIcon.tsx";
import { HelpModal } from "./components/HelpModal.tsx";

interface Question {
  id: string;
  text: string;
  answered: boolean;
  highlighted: boolean;
}

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(() => {
    const storedQuestions = localStorage.getItem("questions");
    return storedQuestions
      ? (JSON.parse(storedQuestions) as Question[])
      : [
          {
            id: Date.now().toString(),
            text: "",
            answered: false,
            highlighted: false,
          },
        ];
  });
  const [title, setTitle] = useState(
    () => localStorage.getItem("title") ?? "Ask me anything",
  );
  const [footer, setFooter] = useState(
    () => localStorage.getItem("footer") ?? "François Martin | www.fmartin.ch",
  );
  const [timeFormat24h, setTimeFormat24h] = useState(
    () => localStorage.getItem("timeFormat24h") === "true",
  );
  const [qrCodeURL, setQrCodeURL] = useState(
    () => localStorage.getItem("qrCodeURL") ?? "",
  );
  const [qrCodeSize, setQrCodeSize] = useState(() =>
    parseFloat(localStorage.getItem("qrCodeSize") ?? "64"),
  );
  const [fontSize, setFontSize] = useState(() =>
    parseInt(localStorage.getItem("fontSize") ?? "16"),
  );
  const [key, setKey] = useState(0); // Key to force re-render on font size change
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("isDarkMode") === "true",
  );
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem("questions", JSON.stringify(questions));
    localStorage.setItem("title", title);
    localStorage.setItem("footer", footer);
    localStorage.setItem("timeFormat24h", String(timeFormat24h));
    localStorage.setItem("qrCodeURL", qrCodeURL);
    localStorage.setItem("qrCodeSize", qrCodeSize.toString());
    localStorage.setItem("isDarkMode", String(isDarkMode));
  }, [
    questions,
    title,
    footer,
    timeFormat24h,
    qrCodeURL,
    qrCodeSize,
    isDarkMode,
  ]);

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize.toString());
    // TODO is there a better way to do this?
    setKey((prev) => prev + 1); // Update key to force a re-render
  }, [fontSize]);

  // TODO is there a way to use react-hotkeys-hook that doesn't cause it to exit fullscreen mode when pressing ctrl?
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenToggle = useCallback(async () => {
    if (screenfull.isEnabled) {
      if (!isFullscreen) {
        await screenfull.request();
        setIsFullscreen(true);
      } else {
        await screenfull.exit();
        setIsFullscreen(false);
      }
    }
  }, [isFullscreen]);

  // Add event listeners for `Ctrl + f` manually
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "f") {
        event.preventDefault(); // Prevent default browser behavior
        void handleFullscreenToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleFullscreenToggle]);

  // Listen for external fullscreen changes (e.g., Esc key exits fullscreen)
  useEffect(() => {
    if (screenfull.isEnabled) {
      const handleScreenfullChange = () => {
        if (!screenfull.isFullscreen) {
          setIsFullscreen(false);
        }
      };

      screenfull.on("change", handleScreenfullChange);
      return () => {
        screenfull.off("change", handleScreenfullChange);
      };
    }
  }, []);

  // Handle keyboard shortcuts
  useHotkeys(
    "ctrl+p",
    () => setFontSize((size) => size + 2),
    { enableOnFormTags: true },
    [setFontSize],
  );
  useHotkeys(
    "ctrl+m",
    () => setFontSize((size) => Math.max(12, size - 2)),
    { enableOnFormTags: true },
    [setFontSize],
  );
  useHotkeys(
    "ctrl+shift+backspace",
    () => setShowClearModal(true),
    { enableOnFormTags: true },
    [setShowClearModal],
  );
  useHotkeys(
    "ctrl+d",
    () => setIsDarkMode((prev) => !prev),
    { enableOnFormTags: true },
    [setIsDarkMode],
  );

  // Fullscreen QR Code
  const [showFullScreenQr, setShowFullScreenQr] = useState(false);
  useHotkeys(
    "ctrl+q",
    () => setShowFullScreenQr((prev) => !prev),
    { enableOnFormTags: true },
    [setShowFullScreenQr],
  );

  const saveToFile = useCallback(async () => {
    const date = new Date();
    const fileName = generateFileName(title, date);
    const markdownContent = generateMarkdownContent(
      title,
      footer,
      date,
      questions,
    );

    await saveFile(fileName, markdownContent);
  }, [questions, title, footer]);

  // Add hotkey for saving to file
  useHotkeys("ctrl+s", () => void saveToFile(), { enableOnFormTags: true }, [
    saveToFile,
  ]);

  // Add hotkey to show help
  useHotkeys(
    "ctrl+h",
    () => setShowHelpModal(true),
    { enableOnFormTags: true },
    [setShowHelpModal],
  );

  // Update questions using immer
  const updateQuestions = useCallback(
    (updateFunc: (draft: Question[]) => void) => {
      setQuestions(produce(questions, updateFunc));
    },
    [questions],
  );

  return (
    <div
      key={key}
      className={`${isDarkMode ? "dark" : ""}`}
      style={{ fontSize: `${fontSize}px` }}
    >
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
        showFullScreenQr={showFullScreenQr}
        setShowFullScreenQr={setShowFullScreenQr}
      />
      <Modal
        title="Confirm Clear"
        message="Are you sure you want to clear the list?"
        onConfirm={() => {
          setQuestions([
            {
              id: Date.now().toString(),
              text: "",
              answered: false,
              highlighted: false,
            },
          ]);
          setShowClearModal(false);
        }}
        onCancel={() => setShowClearModal(false)}
        isOpen={showClearModal}
      />
      <HelpIcon onClick={() => setShowHelpModal(true)} />
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
      <PWABadge />
    </div>
  );
};

export default App;

import React, { useState, useEffect, useCallback } from "react";
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
import GuidedTour from "./components/GuidedTour.tsx";
import {
  useClearQuestions,
  useDarkMode,
  useDecreaseFontSize,
  useFontSize,
  useFooter,
  useIncreaseFontSize,
  useQuestions,
  useTitle,
  useToggleDarkMode,
} from "./stores";
import { migrateLocalStorage } from "./migration.ts";
import { Help } from "./components/help/Help.tsx";

const App: React.FC = () => {
  migrateLocalStorage();

  const isDarkMode = useDarkMode();
  const toggleDarkMode = useToggleDarkMode();
  const fontSize = useFontSize();
  const increaseFontSize = useIncreaseFontSize();
  const decreaseFontSize = useDecreaseFontSize();
  const title = useTitle();
  const footer = useFooter();
  const questions = useQuestions();
  const clearQuestions = useClearQuestions();

  const [key, setKey] = useState(0); // Key to force re-render on font size change
  const [showClearModal, setShowClearModal] = useState<boolean>(false);

  useEffect(() => {
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
  useHotkeys("ctrl+p", () => increaseFontSize(), { enableOnFormTags: true }, [
    increaseFontSize,
  ]);
  useHotkeys("ctrl+m", () => decreaseFontSize(), { enableOnFormTags: true }, [
    decreaseFontSize,
  ]);
  useHotkeys(
    "ctrl+shift+backspace",
    () => setShowClearModal(true),
    { enableOnFormTags: true },
    [setShowClearModal],
  );
  useHotkeys("ctrl+d", () => toggleDarkMode(), { enableOnFormTags: true }, [
    toggleDarkMode,
  ]);

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

  return (
    <div
      key={key}
      className={`${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      } ${isDarkMode ? "dark" : "light"}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      <MainLayout />
      <Modal
        title="Confirm Clear"
        message="Are you sure you want to clear the list?"
        onConfirm={() => {
          clearQuestions();
          setShowClearModal(false);
        }}
        onCancel={() => setShowClearModal(false)}
        isOpen={showClearModal}
      />
      <Help />
      <PWABadge />
      <GuidedTour />
    </div>
  );
};

export default App;

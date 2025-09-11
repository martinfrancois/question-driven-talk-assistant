import React, { useState, useEffect, useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import PWABadge from "./PWABadge.tsx";
import screenfull from "screenfull";
import {
  generateFileName,
  generateMarkdownContent,
  saveFile,
} from "./save-questions.ts";
import {
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
import GuidedTour from "./components/onboarding/GuidedTour.tsx";
import MainLayout from "./components/layout/MainLayout.tsx";
import { FullScreenQrCode } from "./components/qr/FullScreenQrCode.tsx";
import { ClearQuestionsModal } from "./components/questions/ClearQuestionsModal.tsx";
import { useDarkModeClassName } from "./components/hooks/dark-mode-classnames.ts";

const App = () => {
  migrateLocalStorage();

  const toggleDarkMode = useToggleDarkMode();
  const fontSize = useFontSize();
  const increaseFontSize = useIncreaseFontSize();
  const decreaseFontSize = useDecreaseFontSize();
  const title = useTitle();
  const footer = useFooter();
  const questions = useQuestions();

  const darkModeClassName = useDarkModeClassName();

  const [key, setKey] = useState(0); // Key to force re-render on font size change

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
      className={`${darkModeClassName} bg-white text-black dark:bg-neutral-900 dark:text-white`}
      style={{ fontSize: `${fontSize}px` }}
    >
      <MainLayout />
      <ClearQuestionsModal />
      <FullScreenQrCode />
      <Help />
      <PWABadge />
      <GuidedTour />
    </div>
  );
};

export default App;

import HelpIcon from "./HelpIcon.tsx";
import { HelpModal } from "./HelpModal.tsx";
import React, { JSX, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

/**
 * `Help` component that displays a help icon and opens a modal when triggered.
 *
 * Features:
 * - Renders a floating help icon in the UI.
 * - Opens the help modal when the icon is clicked or when `Ctrl+H` is pressed.
 *
 * Uses:
 * - `useHotkeys` to bind `Ctrl+H` as a shortcut to open the modal.
 * - Local state to control the visibility of the modal.
 */
export const Help = (): JSX.Element => {
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Add hotkey to show help
  useHotkeys(
    "ctrl+h",
    () => setShowHelpModal(true),
    { enableOnFormTags: true },
    [setShowHelpModal],
  );

  return (
    <>
      <HelpIcon onClick={() => setShowHelpModal(true)} />
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </>
  );
};

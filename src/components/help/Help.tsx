import HelpIcon from "./HelpIcon.tsx";
import { HelpModal } from "./HelpModal.tsx";
import React, { JSX, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

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

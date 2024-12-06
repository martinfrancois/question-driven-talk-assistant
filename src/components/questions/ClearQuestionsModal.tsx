import { useState } from "react";
import Modal from "../ui/Modal.tsx";
import { useClearQuestions } from "@/stores";
import { useHotkeys } from "react-hotkeys-hook";

export function ClearQuestionsModal() {
  const clearQuestions = useClearQuestions();

  const [showClearModal, setShowClearModal] = useState<boolean>(false);

  useHotkeys(
    "ctrl+shift+backspace",
    () => setShowClearModal(true),
    { enableOnFormTags: true },
    [setShowClearModal],
  );

  return (
    <Modal
      title="Confirm Clear"
      message="Are you sure you want to clear the list?"
      confirmText="Clear"
      onConfirm={() => {
        clearQuestions();
        setShowClearModal(false);
      }}
      onCancel={() => setShowClearModal(false)}
      isOpen={showClearModal}
    />
  );
}

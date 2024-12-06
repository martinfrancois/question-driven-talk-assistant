import React from "react";
import { AiOutlineQuestionCircle } from "react-icons/ai";

interface HelpIconProps {
  onClick: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

const HelpIcon: React.FC<HelpIconProps> = ({ onClick, buttonRef }) => (
  <button
    onClick={onClick}
    ref={buttonRef}
    aria-label="Open help"
    data-testid="help-icon"
    className="fixed bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-lg border-0 bg-transparent p-0 text-neutral-500 opacity-10 transition-all duration-300 hover:border hover:bg-neutral-200 hover:text-neutral-700 hover:opacity-100 focus:opacity-100 focus:ring-2 focus:ring-blue-500 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 dark:focus:ring-blue-400"
  >
    <AiOutlineQuestionCircle size={24} />
  </button>
);

export default HelpIcon;

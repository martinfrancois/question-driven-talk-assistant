import React from "react";
import { AiOutlineQuestionCircle } from "react-icons/ai";

interface HelpIconProps {
  onClick: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

const HelpIcon: React.FC<HelpIconProps> = ({ onClick, buttonRef }) => (
  <button
    onClick={onClick}
    ref={buttonRef}
    aria-label="Open help"
    data-testid="help-icon"
    className="fixed bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-lg border-0 bg-transparent p-0 text-gray-500 opacity-10 transition-all duration-300 hover:border hover:bg-gray-200 hover:text-gray-700 hover:opacity-100 focus:opacity-100 focus:ring-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 dark:focus:ring-blue-400"
  >
    <AiOutlineQuestionCircle size={24} />
  </button>
);

export default HelpIcon;

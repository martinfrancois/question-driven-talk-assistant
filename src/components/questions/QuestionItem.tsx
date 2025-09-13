import React, {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Question,
  useAddQuestion,
  useClickCheckbox,
  useInsertQuestion,
  useMoveQuestionDown,
  useMoveQuestionUp,
  useQuestions,
  useRemoveQuestion,
  useUpdateQuestionText,
} from "@/stores";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { getCheckboxState } from "@/lib/get-checkbox-state.ts";
import { handleKeyPress as handleKeyPressExternal } from "./handle-key-press.ts";
import { useAutoResizeTextArea } from "@/components/hooks/use-auto-resize-textarea.ts";

interface QuestionItemProps {
  question: Question;
  questionRefs: React.RefObject<
    Record<string, React.RefObject<HTMLTextAreaElement | null>>
  >;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  index: number;
}

const QuestionItem: FC<QuestionItemProps> = ({
  question,
  questionRefs,
  textareaRef,
  index,
}) => {
  const questions = useQuestions();
  const moveQuestionUp = useMoveQuestionUp();
  const moveQuestionDown = useMoveQuestionDown();
  const updateQuestionText = useUpdateQuestionText();
  const removeQuestion = useRemoveQuestion();
  const insertQuestion = useInsertQuestion();
  const addQuestion = useAddQuestion();
  const clickCheckbox = useClickCheckbox();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const baseClasses =
    "border-b outline-hidden focus:border-blue-500 transition-colors w-full resize-none";
  const textColor = "text-black dark:text-white";
  const bgColor = question.highlighted
    ? "bg-neutral-200 dark:bg-neutral-600 rounded-lg"
    : "bg-transparent";

  const { adjustHeight } = useAutoResizeTextArea(textareaRef);

  const clickCheckboxHandler = useCallback<
    MouseEventHandler<HTMLButtonElement>
  >(() => clickCheckbox(question.id), [clickCheckbox, question.id]);

  useEffect(() => {
    adjustHeight();
  }, [question.text, adjustHeight]);

  const [isFocused, setIsFocused] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");

  /**
   * Announces messages to assistive technologies via ARIA live regions.
   * @param {string} message - The message to announce.
   */
  const announceLiveRegion = (message: string) => {
    setLiveMessage(message);
    // Clear the message after it's announced
    setTimeout(() => setLiveMessage(""), 100);
  };

  // Handle keyboard shortcuts for moving questions
  useHotkeys(
    "ctrl+shift+up",
    () => {
      const currentIndex = questions.findIndex((q) => q.id === question.id);
      if (currentIndex > 0) {
        moveQuestionUp(currentIndex);
        announceLiveRegion(`Moved question "${question.text}" up.`);
      }
    },
    { enableOnFormTags: true, enabled: isFocused },
    [questions, question.id, moveQuestionUp, isFocused, question.text],
  );

  useHotkeys(
    "ctrl+shift+down",
    () => {
      const currentIndex = questions.findIndex((q) => q.id === question.id);
      if (currentIndex < questions.length - 1) {
        moveQuestionDown(currentIndex);
        announceLiveRegion(`Moved question "${question.text}" down.`);
      }
    },
    { enableOnFormTags: true, enabled: isFocused },
    [questions, question.id, moveQuestionDown, isFocused, question.text],
  );

  useHotkeys(
    "ctrl+enter",
    () => clickCheckbox(question.id),
    { enableOnFormTags: true, enabled: isFocused },
    [clickCheckbox, question.id],
  );

  /**
   * Handles keypress events within the textarea to manage custom behaviors.
   * @param {React.KeyboardEvent} e - The keyboard event.
   */
  const handleKeyPress = (e: React.KeyboardEvent) =>
    handleKeyPressExternal(e, {
      textareaRef,
      questions,
      question,
      updateQuestionText,
      removeQuestion,
      insertQuestion,
      addQuestion,
      questionRefs,
      adjustHeight,
      announceLiveRegion,
    });

  const checkboxState = useMemo(() => getCheckboxState(question), [question]);

  const textareaId = useMemo(() => {
    return "question-text-" + index;
  }, [index]);

  useHotkeys(
    "ctrl+shift+e",
    () => {
      const textarea = textareaRef?.current;
      if (index === 0 && textarea) {
        textarea.focus();
        // move cursor to the end
        textarea.setSelectionRange(
          textarea.value.length,
          textarea.value.length,
        );
      }
    },
    { enableOnFormTags: true },
    [questions, question.id, moveQuestionDown, isFocused, question.text],
  );

  return (
    <div
      role="listitem"
      style={style}
      className={`flex items-center space-x-2 p-2 ${bgColor}`}
      data-testid={`question-item-${question.id}`}
    >
      <span
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="mb-1.5 cursor-grab text-2xl opacity-0 transition-opacity hover:text-neutral-500 hover:opacity-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        data-testid="reorder-button"
        aria-hidden // using the keyboard shortcuts is a better user experience with assistive technologies
        tabIndex={-1}
      >
        &#9776;
      </span>
      <Checkbox
        checked={question.answered}
        onClick={clickCheckboxHandler}
        aria-label={checkboxState}
        data-testid={`question-checkbox-${question.id}`}
      />
      <textarea
        ref={textareaRef}
        className={`${baseClasses} ${textColor} overflow-hidden bg-transparent pr-2 pl-2 ${
          question.answered ? "line-through" : ""
        }`}
        aria-keyshortcuts="Control+Shift+ArrowUp to move question up, Control+Shift+ArrowDown arrow to move down, Control+Enter to click checkbox"
        data-highlighted={question.highlighted}
        aria-label={
          question.text
            ? `Question text: ${question.text}`
            : "Empty Question Text"
        }
        value={question.text}
        id={textareaId}
        onChange={(e) => {
          const newText = e.target.value;
          updateQuestionText(question.id, newText);
          adjustHeight();
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyPress}
        rows={1}
        spellCheck={false}
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
      />
      {/* ARIA Live Region for Announcements */}
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>
    </div>
  );
};

export default QuestionItem;

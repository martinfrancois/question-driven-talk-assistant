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
  createEmptyQuestion,
  Question,
  useAddQuestion,
  useClickCheckbox,
  useInsertQuestion,
  useMoveQuestionDown,
  useMoveQuestionUp,
  useQuestions,
  useRemoveQuestion,
  useUpdateQuestionText,
} from "../../stores";
import { Checkbox } from "@/components/ui/checkbox.tsx";

interface QuestionItemProps {
  question: Question;
  questionRefs: React.MutableRefObject<
    Record<string, React.RefObject<HTMLTextAreaElement>>
  >;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

function getCheckboxState(question: Question): string {
  const { answered, highlighted, text } = question;

  const constructMessage = (action: string, text: string | null): string => {
    return text ? `${action} question: ${text}` : `${action} empty question`;
  };

  if (answered) {
    return constructMessage("Answered", text);
  }

  if (highlighted) {
    return constructMessage("Currently answering", text);
  }

  return text ? `Question: ${text}` : "Empty Question";
}

const QuestionItem: FC<QuestionItemProps> = ({
  question,
  questionRefs,
  textareaRef,
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
    "border-b outline-none focus:border-blue-500 transition-colors w-full resize-none";
  const textColor = "text-black dark:text-white";
  const bgColor = question.highlighted
    ? "bg-neutral-200 dark:bg-neutral-600 rounded-lg"
    : "bg-transparent";

  const adjustHeight = useCallback(() => {
    if (textareaRef?.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [textareaRef]);

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
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!textareaRef?.current) return;

    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;

    // Split textarea content into lines
    const lines = textarea.value.split("\n");
    const isMultiLineAndEmpty =
      lines.length > 1 && lines.every((line) => line.trim() === "");

    if (e.key === "Backspace") {
      // Prevent action when cursor is on the first line of an empty multi-line textarea
      if (isMultiLineAndEmpty && cursorPosition === 0) {
        e.preventDefault();
        return;
      }

      // Remove a line if on the second line and pressing Backspace
      if (isMultiLineAndEmpty && cursorPosition > 0) {
        e.preventDefault();
        const newText =
          textarea.value.slice(0, cursorPosition - 1) +
          textarea.value.slice(cursorPosition);

        updateQuestionText(question.id, newText);
        adjustHeight();
        return;
      }

      // Delete question if it is completely empty
      if (question.text.trim() === "") {
        e.preventDefault();
        if (questions.length > 1) {
          const currentIndex = questions.findIndex((q) => q.id === question.id);
          if (currentIndex === 0) {
            // Delete first question and focus the new first question
            removeQuestion(currentIndex);
            const newFirstRef = questionRefs.current[questions[1].id];
            if (newFirstRef?.current) {
              newFirstRef.current.focus();
              newFirstRef.current.setSelectionRange(0, 0);
              announceLiveRegion(`First question was deleted.`); // TODO not read out?
            }
          } else {
            // Delete current question and focus previous question
            removeQuestion(currentIndex);
            setTimeout(() => {
              const prevQuestion = questions[currentIndex - 1];
              const prevRef = questionRefs.current[prevQuestion.id];
              if (prevRef?.current) {
                prevRef.current.focus();
                const position = prevRef.current.value.length;
                prevRef.current.setSelectionRange(position, position);
                announceLiveRegion(`Deleted question.`); // TODO not read out?
              }
            }, 0);
          }
        }
        return;
      }
    }

    // Get text before cursor
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    // Split text before cursor into lines
    const linesBeforeCursor = textBeforeCursor.split("\n");
    // Current line number (0-based)
    const currentLineNumber = linesBeforeCursor.length - 1;

    // Total lines in the current textarea
    const totalLines = textarea.value.split("\n").length;

    const currentIndex = questions.findIndex((q) => q.id === question.id);
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      // Handle Enter key
      e.preventDefault();
      if (
        question.text.trim() !== "" &&
        (!questions[currentIndex + 1] ||
          questions[currentIndex + 1].text.trim() !== "")
      ) {
        const newQuestion = createEmptyQuestion();
        insertQuestion(currentIndex + 1, newQuestion);
        announceLiveRegion(`Added a new question below and focused it.`);
        setTimeout(() => {
          const newRef = questionRefs.current[newQuestion.id];
          if (newRef?.current) {
            newRef.current.focus();
            newRef.current.setSelectionRange(0, 0);
          }
        }, 0);
      }
    } else if (
      e.key === "ArrowDown" &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.altKey
    ) {
      const isAtLastLine = currentLineNumber === totalLines - 1;

      if (isAtLastLine) {
        // Cursor is at last line, move focus to next textarea
        e.preventDefault();
        if (currentIndex < questions.length - 1) {
          const nextQuestion = questions[currentIndex + 1];
          const nextRef = questionRefs.current[nextQuestion.id];
          if (nextRef?.current) {
            nextRef.current.focus();

            // Place cursor at the end of the first line in the next textarea
            const nextTextarea = nextRef.current;
            const nextTextLines = nextTextarea.value.split("\n");

            // First line index (0)
            const lineIndex = 0;
            let position = 0;
            for (let i = 0; i <= lineIndex; i++) {
              position += nextTextLines[i]?.length ?? 0;
              if (i < lineIndex) position += 1; // +1 for newline
            }
            nextTextarea.setSelectionRange(position, position);
          }
        }
      } else {
        // Allow default behavior (move cursor down within textarea)
      }
    } else if (e.key === "ArrowUp" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      const isAtFirstLine = currentLineNumber === 0;

      if (isAtFirstLine) {
        // Cursor is at first line, move focus to previous textarea
        e.preventDefault();
        if (currentIndex > 0) {
          const prevQuestion = questions[currentIndex - 1];
          const prevRef = questionRefs.current[prevQuestion.id];
          if (prevRef?.current) {
            prevRef.current.focus();

            // Place cursor at the end of the last line in the previous textarea
            const prevTextarea = prevRef.current;
            const prevTextLines = prevTextarea.value.split("\n");

            // Last line index
            const lineIndex = prevTextLines.length - 1;
            let position = 0;
            for (let i = 0; i <= lineIndex; i++) {
              position += prevTextLines[i]?.length ?? 0;
              if (i < lineIndex) position += 1; // +1 for newline
            }
            prevTextarea.setSelectionRange(position, position);
          }
        }
      } else {
        // Allow default behavior (move cursor up within textarea)
      }
    } else if (e.key === "Tab" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      // Handle Tab key
      e.preventDefault();
      if (currentIndex < questions.length - 1) {
        // Not the last question
        const nextQuestion = questions[currentIndex + 1];
        const nextRef = questionRefs.current[nextQuestion.id];
        if (nextRef?.current) {
          nextRef.current.focus();

          // Set cursor at the end of the text in the next textarea
          const nextTextarea = nextRef.current;
          const position = nextTextarea.value.length;
          nextTextarea.setSelectionRange(position, position);
        }
      } else {
        // Last textarea
        if (question.text.trim() !== "") {
          // Text is not empty, add new question
          const newQuestion = createEmptyQuestion();
          addQuestion(newQuestion);
          announceLiveRegion(`Added a new question below and focused it.`);
          setTimeout(() => {
            const newRef = questionRefs.current[newQuestion.id];
            if (newRef?.current) {
              newRef.current.focus();
              // Cursor at position 0 in new empty textarea
              newRef.current.setSelectionRange(0, 0);
            }
          }, 0);
        } else {
          // Text is empty, do nothing
          // No action needed
        }
      }
    } else if (e.key === "Tab" && e.shiftKey && !e.ctrlKey && !e.altKey) {
      // Handle Shift+Tab key
      e.preventDefault();
      if (currentIndex > 0) {
        const prevQuestion = questions[currentIndex - 1];
        const prevRef = questionRefs.current[prevQuestion.id];
        if (prevRef?.current) {
          prevRef.current.focus();

          // Set cursor at the end of the text in the previous textarea
          const prevTextarea = prevRef.current;
          const position = prevTextarea.value.length;
          prevTextarea.setSelectionRange(position, position);
        }
      }
    }
    // Shift+Enter is not handled here to allow default behavior (line break)
  };

  const checkboxState = useMemo(() => getCheckboxState(question), [question]);

  return (
    <div
      role="listitem"
      style={style}
      className={`flex items-center space-x-2 p-2 ${bgColor}`}
      data-testid={`question-item-${question.id}`}
    >
      <button
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="mb-1.5 cursor-grab text-2xl opacity-0 transition-opacity hover:text-neutral-500 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        data-testid="reorder-button"
        aria-hidden={true} // using the keyboard shortcuts is a better user experience with assistive technologies
      >
        &#9776;
      </button>
      <Checkbox
        checked={question.answered}
        onClick={clickCheckboxHandler}
        aria-label={checkboxState}
        data-testid={`question-checkbox-${question.id}`}
      />
      <textarea
        id={`question-text-${question.id}`}
        ref={textareaRef}
        className={`${baseClasses} ${textColor} overflow-hidden bg-transparent pl-2 pr-2 ${
          question.answered ? "line-through" : ""
        }`}
        aria-keyshortcuts="ctrl+shift+up arrow to move question up, ctrl+shift+down arrow to move down, ctrl+enter to click checkbox"
        data-highlighted={question.highlighted}
        aria-label={
          question.text
            ? `Question text: ${question.text}`
            : "Empty Question Text"
        }
        value={question.text}
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

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
} from "@/stores";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { getCheckboxState } from "@/lib/get-checkbox-state.ts";
import {
  currentLineNumberForCursor,
  isMultiLineAndEmptyText,
  positionAtEndOfLine,
  totalLines,
} from "@/lib/text-cursor.ts";
import {
  decideBackspaceAction,
  decideEnterAction,
  decideTabAction,
} from "@/lib/question-keypress.ts";
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
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!textareaRef?.current) return;

    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;

    // Split textarea content into lines
    const isMultiLineAndEmpty = isMultiLineAndEmptyText(textarea.value);

    if (e.key === "Backspace") {
      const currentIndex = questions.findIndex((q) => q.id === question.id);
      const action = decideBackspaceAction({
        textareaValue: textarea.value,
        cursorPosition,
        isCurrentTextEmpty: question.text.trim() === "",
        isMultiLineAndEmpty,
        currentIndex,
        questionsLength: questions.length,
      });
      if (action.type !== "none") {
        e.preventDefault();
        if (action.type === "prevent") return;
        if (action.type === "updateText") {
          updateQuestionText(question.id, action.newText);
          adjustHeight();
          return;
        }
        if (action.type === "deleteQuestion") {
          if (questions.length > 1) {
            if (action.target === "firstNext") {
              removeQuestion(0);
              const firstId = questions[1]?.id;
              const newFirstRef = firstId
                ? questionRefs.current[firstId]
                : undefined;
              if (newFirstRef?.current) {
                newFirstRef.current.focus();
                newFirstRef.current.setSelectionRange(0, 0);
                announceLiveRegion("First question was deleted."); // TODO not read out?
              }
            } else {
              const currentIdx = currentIndex;
              removeQuestion(currentIdx);
              setTimeout(() => {
                const prevQuestion = questions[currentIdx - 1];
                const prevRef = questionRefs.current[prevQuestion.id];
                if (prevRef?.current) {
                  prevRef.current.focus();
                  const position = prevRef.current.value.length;
                  prevRef.current.setSelectionRange(position, position);
                  announceLiveRegion("Deleted question."); // TODO not read out?
                }
              }, 0);
            }
          }
          return;
        }
      }
    }

    const currentLineNumber = currentLineNumberForCursor(
      textarea.value,
      cursorPosition,
    );

    // Total lines in the current textarea
    const total = totalLines(textarea.value);

    const currentIndex = questions.findIndex((q) => q.id === question.id);
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      const action = decideEnterAction({
        currentTextTrimmed: question.text.trim(),
        hasNext: Boolean(questions[currentIndex + 1]),
        nextTextTrimmed: questions[currentIndex + 1]?.text ?? null,
      });
      e.preventDefault();
      if (action.type === "insertBelow") {
        const newQuestion = createEmptyQuestion();
        insertQuestion(currentIndex + 1, newQuestion);
        announceLiveRegion("Added a new question below and focused it.");
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
      const isAtLastLine = currentLineNumber === total - 1;

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
            const pos = positionAtEndOfLine(nextTextarea.value, 0);
            nextTextarea.setSelectionRange(pos, pos);
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
            const pos = positionAtEndOfLine(
              prevTextarea.value,
              totalLines(prevTextarea.value) - 1,
            );
            prevTextarea.setSelectionRange(pos, pos);
          }
        }
      } else {
        // Allow default behavior (move cursor up within textarea)
      }
    } else if (e.key === "Tab" && !e.ctrlKey && !e.altKey) {
      const tabAction = decideTabAction({
        shiftKey: e.shiftKey,
        currentIndex,
        questionsLength: questions.length,
        isCurrentEmpty: question.text.trim() === "",
      });
      if (tabAction.type !== "none") {
        e.preventDefault();
        if (tabAction.type === "focusNext") {
          const nextQuestion = questions[currentIndex + 1];
          const nextRef = questionRefs.current[nextQuestion.id];
          if (nextRef?.current) {
            nextRef.current.focus();
            const position = nextRef.current.value.length;
            nextRef.current.setSelectionRange(position, position);
          }
        } else if (tabAction.type === "focusPrev") {
          const prevQuestion = questions[currentIndex - 1];
          const prevRef = questionRefs.current[prevQuestion.id];
          if (prevRef?.current) {
            prevRef.current.focus();
            const position = prevRef.current.value.length;
            prevRef.current.setSelectionRange(position, position);
          }
        } else if (tabAction.type === "createNewAndFocus") {
          const newQuestion = createEmptyQuestion();
          addQuestion(newQuestion);
          announceLiveRegion("Added a new question below and focused it.");
          setTimeout(() => {
            const newRef = questionRefs.current[newQuestion.id];
            if (newRef?.current) {
              newRef.current.focus();
              newRef.current.setSelectionRange(0, 0);
            }
          }, 0);
        }
      }
    }
    // Shift+Enter is not handled here to allow default behavior (line break)
  };

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

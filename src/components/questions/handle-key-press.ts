import type { KeyboardEvent, RefObject } from "react";
import { createEmptyQuestion } from "@/stores";
import type {
  Question,
  useAddQuestion,
  useInsertQuestion,
  useRemoveQuestion,
  useUpdateQuestionText,
} from "@/stores";
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

export interface HandleKeyPressDeps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  questions: Question[];
  question: Question;
  updateQuestionText: ReturnType<typeof useUpdateQuestionText>;
  removeQuestion: ReturnType<typeof useRemoveQuestion>;
  insertQuestion: ReturnType<typeof useInsertQuestion>;
  addQuestion: ReturnType<typeof useAddQuestion>;
  questionRefs: RefObject<
    Record<string, RefObject<HTMLTextAreaElement | null>>
  >;
  adjustHeight: () => void;
  announceLiveRegion: (message: string) => void;
}

/**
 * Handles keypress events within the textarea to manage custom behaviors.
 * @param {React.KeyboardEvent} e - The keyboard event.
 */
export function handleKeyPress(
  e: KeyboardEvent,
  {
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
  }: HandleKeyPressDeps,
) {
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
  } else if (e.key === "ArrowDown" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
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
}

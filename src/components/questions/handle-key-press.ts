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
  questionRefs: RefObject<Map<string, RefObject<HTMLTextAreaElement | null>>>;
  adjustHeight: () => void;
  announceLiveRegion: (message: string) => void;
}

type MinimalKeyboardEvent = Pick<
  KeyboardEvent,
  "key" | "shiftKey" | "ctrlKey" | "altKey" | "preventDefault"
>;

/**
 * Handles keypress events within a question textarea: deleting, inserting,
 * and moving between questions.
 */
export function handleKeyPress(
  e: MinimalKeyboardEvent,
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
  const currentIndex = questions.findIndex((q) => q.id === question.id);
  const isCurrentEmpty = question.text.trim() === "";

  if (e.key === "Backspace") {
    const action = decideBackspaceAction({
      textareaValue: textarea.value,
      cursorPosition,
      isCurrentTextEmpty: isCurrentEmpty,
      isMultiLineAndEmpty: isMultiLineAndEmptyText(textarea.value),
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
        if (action.target === "firstNext") {
          removeQuestion(0);
          const newFirstRef = questionRefs.current.get(questions[1].id);
          if (newFirstRef?.current) {
            newFirstRef.current.focus();
            newFirstRef.current.setSelectionRange(0, 0);
            announceLiveRegion("First question was deleted."); // TODO not read out?
          }
        } else {
          removeQuestion(currentIndex);
          setTimeout(() => {
            const prevQuestion = questions[currentIndex - 1];
            const prevRef = questionRefs.current.get(prevQuestion.id);
            if (prevRef?.current) {
              prevRef.current.focus();
              const position = prevRef.current.value.length;
              prevRef.current.setSelectionRange(position, position);
              announceLiveRegion("Deleted question."); // TODO not read out?
            }
          }, 0);
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

  if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
    const action = decideEnterAction({
      currentTextTrimmed: question.text.trim(),
      hasNext: Boolean(questions[currentIndex + 1]),
      nextText: questions[currentIndex + 1]?.text ?? null,
    });
    e.preventDefault();
    if (action.type === "insertBelow") {
      const newQuestion = createEmptyQuestion();
      insertQuestion(currentIndex + 1, newQuestion);
      announceLiveRegion("Added a new question below and focused it.");
      setTimeout(() => {
        const newRef = questionRefs.current.get(newQuestion.id);
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
        const nextRef = questionRefs.current.get(nextQuestion.id);
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
        const prevRef = questionRefs.current.get(prevQuestion.id);
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
    // Tab and Shift+Tab never leave the question list, even when there is
    // nothing to move to.
    e.preventDefault();
    const tabAction = decideTabAction({
      shiftKey: e.shiftKey,
      currentIndex,
      questionsLength: questions.length,
      isCurrentEmpty,
    });
    if (tabAction.type !== "none") {
      if (tabAction.type === "focusNext") {
        const nextQuestion = questions[currentIndex + 1];
        const nextRef = questionRefs.current.get(nextQuestion.id);
        if (nextRef?.current) {
          nextRef.current.focus();
          const position = nextRef.current.value.length;
          nextRef.current.setSelectionRange(position, position);
        }
      } else if (tabAction.type === "focusPrev") {
        const prevQuestion = questions[currentIndex - 1];
        const prevRef = questionRefs.current.get(prevQuestion.id);
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
          const newRef = questionRefs.current.get(newQuestion.id);
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

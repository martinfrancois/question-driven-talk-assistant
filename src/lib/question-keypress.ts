export type DeleteTarget = "firstNext" | "prev";

export type BackspaceAction =
  | { type: "prevent" }
  | { type: "updateText"; newText: string }
  | { type: "deleteQuestion"; target: DeleteTarget }
  | { type: "none" };

/**
 * Decides what should happen when Backspace is pressed in a question textarea.
 */
export function decideBackspaceAction(params: {
  textareaValue: string;
  cursorPosition: number;
  isCurrentTextEmpty: boolean;
  isMultiLineAndEmpty: boolean;
  currentIndex: number;
  questionsLength: number;
}): BackspaceAction {
  const {
    textareaValue,
    cursorPosition,
    isCurrentTextEmpty,
    isMultiLineAndEmpty,
    currentIndex,
    questionsLength,
  } = params;

  // Prevent action when cursor is on the first line of an empty multi-line textarea
  if (isMultiLineAndEmpty && cursorPosition === 0) {
    return { type: "prevent" };
  }

  // Remove a line if on the second line and pressing Backspace
  if (isMultiLineAndEmpty && cursorPosition > 0) {
    const newText =
      textareaValue.slice(0, cursorPosition - 1) +
      textareaValue.slice(cursorPosition);
    return { type: "updateText", newText };
  }

  // Delete question if it is completely empty
  if (isCurrentTextEmpty && questionsLength > 1) {
    if (currentIndex === 0)
      return { type: "deleteQuestion", target: "firstNext" };
    return { type: "deleteQuestion", target: "prev" };
  }

  return { type: "none" };
}

export type EnterAction = { type: "insertBelow" } | { type: "preventOnly" };

/**
 * Decides what should happen for Enter key (without modifiers).
 *
 * - If current text is not empty AND (there is no next question OR the next is not empty), insert a new question below
 * - Otherwise prevent only (no insertion)
 */
export function decideEnterAction(params: {
  currentTextTrimmed: string;
  hasNext: boolean;
  nextTextTrimmed: string | null;
}): EnterAction {
  const { currentTextTrimmed, hasNext, nextTextTrimmed } = params;
  const shouldInsert =
    currentTextTrimmed !== "" &&
    (!hasNext || (nextTextTrimmed ?? "").trim() !== "");
  if (shouldInsert) return { type: "insertBelow" };
  return { type: "preventOnly" };
}

export type TabAction =
  | { type: "focusPrev" }
  | { type: "focusNext" }
  | { type: "createNewAndFocus" }
  | { type: "none" };

/**
 * Decides what should happen for Tab / Shift+Tab navigation between questions.
 *
 * - Shift+Tab: move focus to previous question when possible
 * - Tab on non-last question: move focus to next question
 * - Tab on last question with non-empty text: add a new question and focus it
 * - Otherwise: do nothing
 */
export function decideTabAction(params: {
  shiftKey: boolean;
  currentIndex: number;
  questionsLength: number;
  isCurrentEmpty: boolean;
}): TabAction {
  const { shiftKey, currentIndex, questionsLength, isCurrentEmpty } = params;

  if (shiftKey) {
    if (currentIndex > 0) return { type: "focusPrev" };
    return { type: "none" };
  }

  if (currentIndex < questionsLength - 1) return { type: "focusNext" };

  if (!isCurrentEmpty) return { type: "createNewAndFocus" };

  return { type: "none" };
}

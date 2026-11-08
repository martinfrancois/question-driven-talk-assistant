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
  type DeleteTarget,
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
  "key" | "shiftKey" | "ctrlKey" | "altKey" | "preventDefault" | "keyCode"
> & { nativeEvent: Pick<globalThis.KeyboardEvent, "isComposing"> };

const IME_KEY_CODE = 229;

// Safari fires the Enter keydown that confirms a composition after
// compositionend, so isComposing is already false and only keyCode 229 marks
// it. Android keyboards report 229 for ordinary keys too, so that check stays
// limited to Enter.
const isImeKeyPress = (e: MinimalKeyboardEvent) =>
  e.nativeEvent.isComposing ||
  (e.key === "Enter" && e.keyCode === IME_KEY_CODE);

interface KeyPressContext extends HandleKeyPressDeps {
  textarea: HTMLTextAreaElement;
  currentIndex: number;
  isCurrentEmpty: boolean;
}

/** Returns where the caret goes in a textarea with the given value. */
type CaretPlacement = (value: string) => number;

const atStart: CaretPlacement = () => 0;
const atEnd: CaretPlacement = (value) => value.length;
const atEndOfFirstLine: CaretPlacement = (value) =>
  positionAtEndOfLine(value, 0);
const atEndOfLastLine: CaretPlacement = (value) =>
  positionAtEndOfLine(value, totalLines(value) - 1);

/**
 * Focuses the textarea of the question with `id` and places its caret.
 * Returns false when that textarea isn't mounted.
 */
function focusQuestion(
  questionRefs: HandleKeyPressDeps["questionRefs"],
  id: string,
  caret: CaretPlacement,
): boolean {
  const textarea = questionRefs.current.get(id)?.current;
  if (!textarea) return false;
  textarea.focus();
  const position = caret(textarea.value);
  textarea.setSelectionRange(position, position);
  return true;
}

/**
 * Creates an empty question with `add`, announces it, and focuses it once
 * React has rendered its textarea.
 */
function createAndFocus(
  add: (question: Question) => void,
  { questionRefs, announceLiveRegion }: KeyPressContext,
): void {
  const newQuestion = createEmptyQuestion();
  add(newQuestion);
  announceLiveRegion("Added a new question below and focused it.");
  setTimeout(() => focusQuestion(questionRefs, newQuestion.id, atStart), 0);
}

function deleteQuestion(target: DeleteTarget, ctx: KeyPressContext): void {
  const {
    questions,
    currentIndex,
    questionRefs,
    removeQuestion,
    announceLiveRegion,
  } = ctx;
  if (target === "firstNext") {
    removeQuestion(0);
    if (focusQuestion(questionRefs, questions[1].id, atStart)) {
      announceLiveRegion("First question was deleted."); // TODO not read out?
    }
    return;
  }
  removeQuestion(currentIndex);
  setTimeout(() => {
    if (focusQuestion(questionRefs, questions[currentIndex - 1].id, atEnd)) {
      announceLiveRegion("Deleted question."); // TODO not read out?
    }
  }, 0);
}

function handleBackspace(e: MinimalKeyboardEvent, ctx: KeyPressContext): void {
  const { textarea, question, questions, currentIndex, isCurrentEmpty } = ctx;
  const action = decideBackspaceAction({
    textareaValue: textarea.value,
    cursorPosition: textarea.selectionStart,
    isCurrentTextEmpty: isCurrentEmpty,
    isMultiLineAndEmpty: isMultiLineAndEmptyText(textarea.value),
    currentIndex,
    questionsLength: questions.length,
  });
  if (action.type === "none") return;
  e.preventDefault();
  if (action.type === "updateText") {
    ctx.updateQuestionText(question.id, action.newText);
    ctx.adjustHeight();
  } else if (action.type === "deleteQuestion") {
    deleteQuestion(action.target, ctx);
  }
}

function handleEnter(e: MinimalKeyboardEvent, ctx: KeyPressContext): void {
  const { question, questions, currentIndex } = ctx;
  const action = decideEnterAction({
    currentTextTrimmed: question.text.trim(),
    hasNext: Boolean(questions[currentIndex + 1]),
    nextText: questions[currentIndex + 1]?.text ?? null,
  });
  e.preventDefault();
  if (action.type === "insertBelow") {
    createAndFocus(
      (newQuestion) => ctx.insertQuestion(currentIndex + 1, newQuestion),
      ctx,
    );
  }
}

const caretLine = (textarea: HTMLTextAreaElement) =>
  currentLineNumberForCursor(textarea.value, textarea.selectionStart);

function handleArrowDown(e: MinimalKeyboardEvent, ctx: KeyPressContext): void {
  const { textarea, questions, currentIndex, questionRefs } = ctx;
  // On the last line the key moves to the next question; on any other line
  // the browser moves the caret down.
  if (caretLine(textarea) !== totalLines(textarea.value) - 1) return;
  e.preventDefault();
  if (currentIndex < questions.length - 1) {
    focusQuestion(
      questionRefs,
      questions[currentIndex + 1].id,
      atEndOfFirstLine,
    );
  }
}

function handleArrowUp(e: MinimalKeyboardEvent, ctx: KeyPressContext): void {
  const { textarea, questions, currentIndex, questionRefs } = ctx;
  // On the first line the key moves to the previous question; on any other
  // line the browser moves the caret up.
  if (caretLine(textarea) !== 0) return;
  e.preventDefault();
  if (currentIndex > 0) {
    focusQuestion(
      questionRefs,
      questions[currentIndex - 1].id,
      atEndOfLastLine,
    );
  }
}

function handleTab(e: MinimalKeyboardEvent, ctx: KeyPressContext): void {
  const { questions, currentIndex, isCurrentEmpty, questionRefs } = ctx;
  // Tab and Shift+Tab never leave the question list, even when there is
  // nothing to move to.
  e.preventDefault();
  const action = decideTabAction({
    shiftKey: e.shiftKey,
    currentIndex,
    questionsLength: questions.length,
    isCurrentEmpty,
  });
  if (action.type === "focusNext") {
    focusQuestion(questionRefs, questions[currentIndex + 1].id, atEnd);
  } else if (action.type === "focusPrev") {
    focusQuestion(questionRefs, questions[currentIndex - 1].id, atEnd);
  } else if (action.type === "createNewAndFocus") {
    createAndFocus(ctx.addQuestion, ctx);
  }
}

const hasNoModifier = (e: MinimalKeyboardEvent) =>
  !e.shiftKey && !e.ctrlKey && !e.altKey;

interface KeyBinding {
  accepts: (e: MinimalKeyboardEvent) => boolean;
  handle: (e: MinimalKeyboardEvent, ctx: KeyPressContext) => void;
}

/**
 * The keys a question textarea handles itself. Enter and the arrows ignore
 * modified presses, so Shift+Enter still inserts a line break.
 */
const keyBindings = new Map<string, KeyBinding>([
  ["Backspace", { accepts: () => true, handle: handleBackspace }],
  ["Enter", { accepts: hasNoModifier, handle: handleEnter }],
  ["ArrowDown", { accepts: hasNoModifier, handle: handleArrowDown }],
  ["ArrowUp", { accepts: hasNoModifier, handle: handleArrowUp }],
  // Shift+Tab moves to the previous question.
  ["Tab", { accepts: (e) => !e.ctrlKey && !e.altKey, handle: handleTab }],
]);

/**
 * Handles keypress events within a question textarea: deleting, inserting,
 * and moving between questions.
 */
export function handleKeyPress(
  e: MinimalKeyboardEvent,
  deps: HandleKeyPressDeps,
): void {
  const textarea = deps.textareaRef?.current;
  if (!textarea) return;
  // While an input method editor composes text, its keys (Enter to confirm,
  // arrows and Tab to pick a candidate, Backspace to edit) belong to the
  // composition.
  if (isImeKeyPress(e)) return;

  const binding = keyBindings.get(e.key);
  if (!binding?.accepts(e)) return;

  binding.handle(e, {
    ...deps,
    textarea,
    currentIndex: deps.questions.findIndex((q) => q.id === deps.question.id),
    isCurrentEmpty: deps.question.text.trim() === "",
  });
}

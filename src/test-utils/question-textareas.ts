import { vi } from "vitest";
import type { RefObject } from "react";
import type { Question } from "@/stores";
import {
  handleKeyPress,
  type HandleKeyPressDeps,
} from "@/components/questions/handle-key-press.ts";

/**
 * Test-only fixture for `handleKeyPress`: one real, attached `<textarea>` per
 * question, registered in a refs map the way `QuestionList` does it, plus spies
 * for the store actions. Focus and caret checks therefore run against the
 * browser's real behavior.
 *
 * Questions created through `insertQuestion` or `addQuestion` get a textarea
 * too, as the rendered list would, so focus can move to them.
 */
export function renderQuestionTextareas(texts: string[]) {
  const questions: Question[] = texts.map((text, i) => ({
    id: `q${i}`,
    text,
    answered: false,
    highlighted: false,
  }));
  const questionRefs: HandleKeyPressDeps["questionRefs"] = {
    current: new Map<string, RefObject<HTMLTextAreaElement | null>>(),
  };
  const created: HTMLTextAreaElement[] = [];

  const mountTextarea = (question: Question): HTMLTextAreaElement => {
    const textarea = document.createElement("textarea");
    textarea.value = question.text;
    document.body.appendChild(textarea);
    questionRefs.current.set(question.id, { current: textarea });
    created.push(textarea);
    return textarea;
  };
  const textareas = questions.map(mountTextarea);

  const store = {
    updateQuestionText: vi.fn<HandleKeyPressDeps["updateQuestionText"]>(),
    removeQuestion: vi.fn<HandleKeyPressDeps["removeQuestion"]>(),
    insertQuestion: vi.fn<HandleKeyPressDeps["insertQuestion"]>(
      (_index, question) => {
        mountTextarea(question);
      },
    ),
    addQuestion: vi.fn<HandleKeyPressDeps["addQuestion"]>((question) => {
      mountTextarea(question);
    }),
    adjustHeight: vi.fn<HandleKeyPressDeps["adjustHeight"]>(),
    announceLiveRegion: vi.fn<HandleKeyPressDeps["announceLiveRegion"]>(),
  };

  /**
   * Places the caret in question `index` (at the end unless `cursor` is
   * given) and presses `key` there. Returns the event's preventDefault spy.
   */
  const press = (
    index: number,
    key: string,
    options: {
      cursor?: number;
      shiftKey?: boolean;
      ctrlKey?: boolean;
      altKey?: boolean;
    } = {},
  ) => {
    const textarea = textareas[index];
    const cursor = options.cursor ?? textarea.value.length;
    textarea.focus();
    textarea.setSelectionRange(cursor, cursor);
    const preventDefault = vi.fn<() => void>();
    handleKeyPress(
      {
        key,
        shiftKey: options.shiftKey ?? false,
        ctrlKey: options.ctrlKey ?? false,
        altKey: options.altKey ?? false,
        preventDefault,
      },
      {
        textareaRef: { current: textarea },
        questions,
        question: questions[index],
        questionRefs,
        ...store,
      },
    );
    return preventDefault;
  };

  /** The textarea created for the question passed to insert/addQuestion. */
  const createdTextareaFor = (question: Question | undefined) =>
    question ? questionRefs.current.get(question.id)?.current : undefined;

  const unmount = () => {
    for (const textarea of created) textarea.remove();
  };

  return {
    questions,
    questionRefs,
    textareas,
    store,
    press,
    createdTextareaFor,
    unmount,
  };
}

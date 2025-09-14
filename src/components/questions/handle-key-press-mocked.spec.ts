import { describe, it, expect, vi } from "vitest";
import type { RefObject } from "react";
import type { HandleKeyPressDeps } from "./handle-key-press.ts";
import type { Question } from "@/stores";

function createTextarea(value: string, selectionStart: number) {
  const el = document.createElement("textarea");
  el.value = value;
  el.selectionStart = selectionStart;
  el.selectionEnd = selectionStart;
  return el;
}

function createRef<T>(current: T) {
  return { current } as { current: T };
}

function makeKeyEvent(
  key: string,
  extras?: Partial<{ shiftKey: boolean; ctrlKey: boolean; altKey: boolean }>,
) {
  const preventDefault = vi.fn<() => void>();
  return {
    e: {
      key,
      preventDefault,
      shiftKey: extras?.shiftKey ?? false,
      ctrlKey: extras?.ctrlKey ?? false,
      altKey: extras?.altKey ?? false,
    },
    preventDefault,
  } as const;
}

describe("handleKeyPress with mocks (unit)", () => {
  it("Enter preventOnly branch prevents default without inserting", async () => {
    vi.resetModules();
    vi.doMock("@/lib/question-keypress.ts", async () => {
      const actual = await vi.importActual<
        typeof import("@/lib/question-keypress.ts")
      >("@/lib/question-keypress.ts");
      return {
        ...actual,
        decideEnterAction: () => ({ type: "preventOnly" as const }),
      } satisfies typeof import("@/lib/question-keypress.ts");
    });

    const { handleKeyPress } = await import("./handle-key-press.ts");

    const questions: Question[] = [
      { id: "q1", text: "hello", answered: false, highlighted: false },
      { id: "q2", text: "world", answered: false, highlighted: false },
    ];
    const questionRefs = createRef<
      Record<string, RefObject<HTMLTextAreaElement | null>>
    >({
      q1: createRef<HTMLTextAreaElement | null>(
        document.createElement("textarea"),
      ),
      q2: createRef<HTMLTextAreaElement | null>(
        document.createElement("textarea"),
      ),
    });
    const textareaRef = createRef<HTMLTextAreaElement | null>(
      createTextarea("hello", 0),
    );

    const insertQuestion = vi.fn<(index: number, q: Question) => void>();
    const { e, preventDefault } = makeKeyEvent("Enter");

    const deps: HandleKeyPressDeps = {
      textareaRef,
      questions,
      question: questions[0],
      updateQuestionText: vi.fn<(id: string, text: string) => void>(),
      removeQuestion: vi.fn<(index: number) => void>(),
      insertQuestion,
      addQuestion: vi.fn<(q: Question) => void>(),
      questionRefs,
      adjustHeight: vi.fn<() => void>(),
      announceLiveRegion: vi.fn<(message: string) => void>(),
    };

    handleKeyPress(e, deps);

    expect(preventDefault).toHaveBeenCalled();
    expect(insertQuestion).not.toHaveBeenCalled();
  });

  it("Backspace deleteQuestion path tolerates missing prev/first refs", async () => {
    vi.resetModules();
    const { handleKeyPress } = await import("./handle-key-press.ts");

    {
      const q0 = { id: "a", text: "", answered: false, highlighted: false };
      const q1 = { id: "b", text: "", answered: false, highlighted: false };
      const questions: Question[] = [q0, q1];
      const questionRefs = createRef<
        Record<string, RefObject<HTMLTextAreaElement | null>>
      >({});
      const textareaRef = createRef<HTMLTextAreaElement | null>(
        createTextarea("", 0),
      );
      const { e, preventDefault } = makeKeyEvent("Backspace");
      const removeQuestion = vi.fn<(index: number) => void>();
      const deps: HandleKeyPressDeps = {
        textareaRef,
        questions,
        question: q0,
        updateQuestionText: vi.fn<(id: string, text: string) => void>(),
        removeQuestion,
        insertQuestion: vi.fn<(index: number, q: Question) => void>(),
        addQuestion: vi.fn<(q: Question) => void>(),
        questionRefs,
        adjustHeight: vi.fn<() => void>(),
        announceLiveRegion: vi.fn<(message: string) => void>(),
      };
      handleKeyPress(e, deps);
      expect(preventDefault).toHaveBeenCalled();
      expect(removeQuestion).toHaveBeenCalledWith(0);
    }

    {
      const q0 = { id: "a", text: "", answered: false, highlighted: false };
      const q1 = { id: "b", text: "", answered: false, highlighted: false };
      const questions: Question[] = [q0, q1];
      const questionRefs = createRef<
        Record<string, RefObject<HTMLTextAreaElement | null>>
      >({});
      const textareaRef = createRef<HTMLTextAreaElement | null>(
        createTextarea("", 0),
      );
      const { e, preventDefault } = makeKeyEvent("Backspace");
      const removeQuestion = vi.fn<(index: number) => void>();
      const deps: HandleKeyPressDeps = {
        textareaRef,
        questions,
        question: q1,
        updateQuestionText: vi.fn<(id: string, text: string) => void>(),
        removeQuestion,
        insertQuestion: vi.fn<(index: number, q: Question) => void>(),
        addQuestion: vi.fn<(q: Question) => void>(),
        questionRefs,
        adjustHeight: vi.fn<() => void>(),
        announceLiveRegion: vi.fn<(message: string) => void>(),
      };
      handleKeyPress(e, deps);
      expect(preventDefault).toHaveBeenCalled();
      expect(removeQuestion).toHaveBeenCalledWith(1);
    }
  });

  it("ArrowUp/Down branches tolerate missing neighbor refs", async () => {
    vi.resetModules();
    const { handleKeyPress } = await import("./handle-key-press.ts");

    const questions: Question[] = [
      { id: "q1", text: "a", answered: false, highlighted: false },
      { id: "q2", text: "b", answered: false, highlighted: false },
    ];
    const questionRefs = createRef<
      Record<string, RefObject<HTMLTextAreaElement | null>>
    >({});

    {
      const { e, preventDefault } = makeKeyEvent("ArrowDown");
      const textareaRef = createRef<HTMLTextAreaElement | null>(
        createTextarea("x\ny", 3),
      );
      const deps: HandleKeyPressDeps = {
        textareaRef,
        questions,
        question: questions[0],
        updateQuestionText: vi.fn<(id: string, text: string) => void>(),
        removeQuestion: vi.fn<(index: number) => void>(),
        insertQuestion: vi.fn<(index: number, q: Question) => void>(),
        addQuestion: vi.fn<(q: Question) => void>(),
        questionRefs,
        adjustHeight: vi.fn<() => void>(),
        announceLiveRegion: vi.fn<(message: string) => void>(),
      };
      handleKeyPress(e, deps);
      expect(preventDefault).toHaveBeenCalled();
    }

    {
      const { e, preventDefault } = makeKeyEvent("ArrowUp");
      const textareaRef = createRef<HTMLTextAreaElement | null>(
        createTextarea("x\ny", 0),
      );
      const deps: HandleKeyPressDeps = {
        textareaRef,
        questions,
        question: questions[1],
        updateQuestionText: vi.fn<(id: string, text: string) => void>(),
        removeQuestion: vi.fn<(index: number) => void>(),
        insertQuestion: vi.fn<(index: number, q: Question) => void>(),
        addQuestion: vi.fn<(q: Question) => void>(),
        questionRefs,
        adjustHeight: vi.fn<() => void>(),
        announceLiveRegion: vi.fn<(message: string) => void>(),
      };
      handleKeyPress(e, deps);
      expect(preventDefault).toHaveBeenCalled();
    }
  });

  it("Enter insertBelow path tolerates missing new ref after creation", async () => {
    vi.useFakeTimers();
    vi.resetModules();
    const { handleKeyPress } = await import("./handle-key-press.ts");

    const questions: Question[] = [
      { id: "q1", text: "hello", answered: false, highlighted: false },
    ];
    const questionRefs = createRef<
      Record<string, RefObject<HTMLTextAreaElement | null>>
    >({
      q1: createRef<HTMLTextAreaElement | null>(
        document.createElement("textarea"),
      ),
    });

    const insertQuestion = vi.fn<(index: number, q: Question) => void>();
    const addQuestion = vi.fn<(q: Question) => void>();
    const { e, preventDefault } = makeKeyEvent("Enter");
    const textareaRef = createRef<HTMLTextAreaElement | null>(
      createTextarea("hello", 0),
    );

    const deps: HandleKeyPressDeps = {
      textareaRef,
      questions,
      question: questions[0],
      updateQuestionText: vi.fn<(id: string, text: string) => void>(),
      removeQuestion: vi.fn<(index: number) => void>(),
      insertQuestion: (index, q) => {
        insertQuestion(index, q);
      },
      addQuestion,
      questionRefs,
      adjustHeight: vi.fn<() => void>(),
      announceLiveRegion: vi.fn<(message: string) => void>(),
    };
    handleKeyPress(e, deps);

    expect(preventDefault).toHaveBeenCalled();
    vi.runAllTimers();
    vi.useRealTimers();
  });
});

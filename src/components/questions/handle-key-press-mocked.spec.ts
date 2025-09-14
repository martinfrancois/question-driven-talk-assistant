import { describe, it, expect, vi } from "vitest";
import type { KeyboardEvent, RefObject } from "react";
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
  return { current } as unknown as RefObject<T>;
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
    const e = {
      key: "Enter",
      preventDefault: vi.fn<() => void>(),
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    } satisfies Pick<KeyboardEvent, "key" | "preventDefault" | "shiftKey" | "ctrlKey" | "altKey"> as unknown as KeyboardEvent;

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

    expect(e.preventDefault).toHaveBeenCalled();
    expect(insertQuestion).not.toHaveBeenCalled();
  });

  it("Backspace deleteQuestion path tolerates missing prev/first refs", async () => {
    vi.resetModules();
    // Do not mock decideBackspaceAction; construct conditions to trigger both targets
    const { handleKeyPress } = await import("./handle-key-press.ts");

    // Case 1: delete first and next exists, but no ref for next
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
      const e = {
        key: "Backspace",
        preventDefault: vi.fn<() => void>(),
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
      } satisfies Pick<KeyboardEvent, "key" | "preventDefault" | "shiftKey" | "ctrlKey" | "altKey"> as unknown as KeyboardEvent;
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
      expect(e.preventDefault).toHaveBeenCalled();
      expect(removeQuestion).toHaveBeenCalledWith(0);
    }

    // Case 2: delete prev when current is second, but no ref for prev
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
      const e = {
        key: "Backspace",
        preventDefault: vi.fn<() => void>(),
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
      } satisfies Pick<KeyboardEvent, "key" | "preventDefault" | "shiftKey" | "ctrlKey" | "altKey"> as unknown as KeyboardEvent;
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
      expect(e.preventDefault).toHaveBeenCalled();
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

    // ArrowDown at last line, missing next ref
    {
      const e = {
        key: "ArrowDown",
        preventDefault: vi.fn<() => void>(),
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
      } satisfies Pick<KeyboardEvent, "key" | "preventDefault" | "shiftKey" | "ctrlKey" | "altKey"> as unknown as KeyboardEvent;
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
      expect(e.preventDefault).toHaveBeenCalled();
    }

    // ArrowUp at first line, missing prev ref
    {
      const e = {
        key: "ArrowUp",
        preventDefault: vi.fn<() => void>(),
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
      } satisfies Pick<KeyboardEvent, "key" | "preventDefault" | "shiftKey" | "ctrlKey" | "altKey"> as unknown as KeyboardEvent;
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
      expect(e.preventDefault).toHaveBeenCalled();
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
    const e = {
      key: "Enter",
      preventDefault: vi.fn<() => void>(),
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    } satisfies Pick<KeyboardEvent, "key" | "preventDefault" | "shiftKey" | "ctrlKey" | "altKey"> as unknown as KeyboardEvent;
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
        // Intentionally skip creating a ref for the new question to exercise false branch
      },
      addQuestion,
      questionRefs,
      adjustHeight: vi.fn<() => void>(),
      announceLiveRegion: vi.fn<(message: string) => void>(),
    };
    handleKeyPress(e, deps);

    expect(e.preventDefault).toHaveBeenCalled();
    vi.runAllTimers();
    vi.useRealTimers();
  });
});

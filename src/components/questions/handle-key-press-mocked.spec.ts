import { describe, it, expect, vi } from "vitest";

function createTextarea(value: string, selectionStart: number) {
  const el = document.createElement("textarea");
  el.value = value;
  el.selectionStart = selectionStart as any;
  el.selectionEnd = selectionStart as any;
  return el;
}

function createRef<T>(current: T) {
  return { current } as React.RefObject<T>;
}

describe("handleKeyPress with mocks (unit)", () => {
  it("Enter preventOnly branch prevents default without inserting", async () => {
    vi.resetModules();
    vi.doMock("@/lib/question-keypress.ts", async () => {
      const actual = await vi.importActual<any>("@/lib/question-keypress.ts");
      return {
        ...actual,
        decideEnterAction: () => ({ type: "preventOnly" as const }),
      };
    });

    const { handleKeyPress } = await import("./handle-key-press.ts");

    const questions = [
      { id: "q1", text: "hello", answered: false, highlighted: false },
      { id: "q2", text: "world", answered: false, highlighted: false },
    ];
    const questionRefs = createRef<
      Record<string, React.RefObject<HTMLTextAreaElement | null>>
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

    const insertQuestion = vi.fn();
    const e: any = {
      key: "Enter",
      preventDefault: vi.fn(),
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    };

    handleKeyPress(e, {
      textareaRef,
      questions,
      question: questions[0] as any,
      updateQuestionText: vi.fn() as any,
      removeQuestion: vi.fn() as any,
      insertQuestion: insertQuestion as any,
      addQuestion: vi.fn() as any,
      questionRefs: questionRefs as any,
      adjustHeight: vi.fn(),
      announceLiveRegion: vi.fn(),
    });

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
      const questions = [q0, q1];
      const questionRefs = createRef<
        Record<string, React.RefObject<HTMLTextAreaElement | null>>
      >({});
      const textareaRef = createRef<HTMLTextAreaElement | null>(
        createTextarea("", 0),
      );
      const e: any = {
        key: "Backspace",
        preventDefault: vi.fn(),
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
      };
      const removeQuestion = vi.fn();
      handleKeyPress(e, {
        textareaRef,
        questions,
        question: q0 as any,
        updateQuestionText: vi.fn() as any,
        removeQuestion: removeQuestion as any,
        insertQuestion: vi.fn() as any,
        addQuestion: vi.fn() as any,
        questionRefs: questionRefs as any,
        adjustHeight: vi.fn(),
        announceLiveRegion: vi.fn(),
      });
      expect(e.preventDefault).toHaveBeenCalled();
      expect(removeQuestion).toHaveBeenCalledWith(0);
    }

    // Case 2: delete prev when current is second, but no ref for prev
    {
      const q0 = { id: "a", text: "", answered: false, highlighted: false };
      const q1 = { id: "b", text: "", answered: false, highlighted: false };
      const questions = [q0, q1];
      const questionRefs = createRef<
        Record<string, React.RefObject<HTMLTextAreaElement | null>>
      >({});
      const textareaRef = createRef<HTMLTextAreaElement | null>(
        createTextarea("", 0),
      );
      const e: any = {
        key: "Backspace",
        preventDefault: vi.fn(),
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
      };
      const removeQuestion = vi.fn();
      handleKeyPress(e, {
        textareaRef,
        questions,
        question: q1 as any,
        updateQuestionText: vi.fn() as any,
        removeQuestion: removeQuestion as any,
        insertQuestion: vi.fn() as any,
        addQuestion: vi.fn() as any,
        questionRefs: questionRefs as any,
        adjustHeight: vi.fn(),
        announceLiveRegion: vi.fn(),
      });
      expect(e.preventDefault).toHaveBeenCalled();
      expect(removeQuestion).toHaveBeenCalledWith(1);
    }
  });

  it("ArrowUp/Down branches tolerate missing neighbor refs", async () => {
    vi.resetModules();
    const { handleKeyPress } = await import("./handle-key-press.ts");

    const questions = [
      { id: "q1", text: "a", answered: false, highlighted: false },
      { id: "q2", text: "b", answered: false, highlighted: false },
    ];
    const questionRefs = createRef<
      Record<string, React.RefObject<HTMLTextAreaElement | null>>
    >({});

    // ArrowDown at last line, missing next ref
    {
      const e: any = {
        key: "ArrowDown",
        preventDefault: vi.fn(),
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
      };
      const textareaRef = createRef<HTMLTextAreaElement | null>(
        createTextarea("x\ny", 3),
      );
      handleKeyPress(e, {
        textareaRef,
        questions,
        question: questions[0] as any,
        updateQuestionText: vi.fn() as any,
        removeQuestion: vi.fn() as any,
        insertQuestion: vi.fn() as any,
        addQuestion: vi.fn() as any,
        questionRefs: questionRefs as any,
        adjustHeight: vi.fn(),
        announceLiveRegion: vi.fn(),
      });
      expect(e.preventDefault).toHaveBeenCalled();
    }

    // ArrowUp at first line, missing prev ref
    {
      const e: any = {
        key: "ArrowUp",
        preventDefault: vi.fn(),
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
      };
      const textareaRef = createRef<HTMLTextAreaElement | null>(
        createTextarea("x\ny", 0),
      );
      handleKeyPress(e, {
        textareaRef,
        questions,
        question: questions[1] as any,
        updateQuestionText: vi.fn() as any,
        removeQuestion: vi.fn() as any,
        insertQuestion: vi.fn() as any,
        addQuestion: vi.fn() as any,
        questionRefs: questionRefs as any,
        adjustHeight: vi.fn(),
        announceLiveRegion: vi.fn(),
      });
      expect(e.preventDefault).toHaveBeenCalled();
    }
  });

  it("Enter insertBelow path tolerates missing new ref after creation", async () => {
    vi.useFakeTimers();
    vi.resetModules();
    const { handleKeyPress } = await import("./handle-key-press.ts");

    const questions = [
      { id: "q1", text: "hello", answered: false, highlighted: false },
    ];
    const questionRefs = createRef<
      Record<string, React.RefObject<HTMLTextAreaElement | null>>
    >({
      q1: createRef<HTMLTextAreaElement | null>(
        document.createElement("textarea"),
      ),
    });

    const insertQuestion = vi.fn();
    const addQuestion = vi.fn();
    const e: any = {
      key: "Enter",
      preventDefault: vi.fn(),
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    };
    const textareaRef = createRef<HTMLTextAreaElement | null>(
      createTextarea("hello", 0),
    );

    handleKeyPress(e, {
      textareaRef,
      questions,
      question: questions[0] as any,
      updateQuestionText: vi.fn() as any,
      removeQuestion: vi.fn() as any,
      insertQuestion: ((index: number, q: any) => {
        insertQuestion(index, q);
        // Intentionally do NOT create a ref for the new question to cover the false branch
      }) as any,
      addQuestion: addQuestion as any,
      questionRefs: questionRefs as any,
      adjustHeight: vi.fn(),
      announceLiveRegion: vi.fn(),
    });

    expect(e.preventDefault).toHaveBeenCalled();
    vi.runAllTimers();
    vi.useRealTimers();
  });
});

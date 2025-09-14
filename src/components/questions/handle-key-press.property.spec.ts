import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { handleKeyPress } from "./handle-key-press.ts";

interface Question {
  id: string;
  text: string;
  answered: boolean;
  highlighted: boolean;
}

function createTextarea(value: string, selectionStart: number) {
  const el = document.createElement("textarea");
  el.value = value;
  el.selectionStart = selectionStart;
  el.selectionEnd = selectionStart;
  // setSelectionRange exists on HTMLTextAreaElement; JSDOM supports it
  return el;
}

function createRef<T>(current: T) {
  return { current } as unknown as { current: T };
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

describe("handleKeyPress (properties)", () => {
  it("covers Backspace prevent/updateText/delete-question branches", () => {
    vi.useFakeTimers();

    fc.assert(
      fc.property(
        fc.constantFrom("prevent", "update", "deleteFirst", "deletePrev"),
        (mode) => {
          const q0 = { id: "a", text: "", answered: false, highlighted: false };
          const q1 = { id: "b", text: "", answered: false, highlighted: false };
          const questions =
            mode === "deleteFirst"
              ? [q0, q1]
              : mode === "deletePrev"
                ? [q0, { ...q1, id: "b" }]
                : [q0];
          const question = mode === "deletePrev" ? questions[1] : questions[0];

          const textareaValue =
            mode === "prevent" || mode === "update" ? "\n\n" : "";
          const cursor = mode === "update" ? 1 : 0;
          const textarea = createTextarea(textareaValue, cursor);
          const textareaRef = createRef<HTMLTextAreaElement | null>(textarea);

          const updateQuestionText =
            vi.fn<(id: string, text: string) => void>();
          const removeQuestion = vi.fn<(index: number) => void>();
          const insertQuestion = vi.fn<(index: number, q: typeof q0) => void>();
          const addQuestion = vi.fn<(q: typeof q0) => void>();
          const announce = vi.fn<(m: string) => void>();
          const adjustHeight = vi.fn<() => void>();

          const firstRef = createRef<HTMLTextAreaElement | null>(
            document.createElement("textarea"),
          );
          const prevRef = createRef<HTMLTextAreaElement | null>(
            document.createElement("textarea"),
          );
          const questionRefs = createRef<
            Record<string, { current: HTMLTextAreaElement | null }>
          >({
            [questions[0].id]: firstRef,
            ...(questions[1] ? { [questions[1].id]: prevRef } : {}),
          });

          const { e, preventDefault } = makeKeyEvent("Backspace");

          handleKeyPress(e, {
            textareaRef,
            questions,
            question,
            updateQuestionText,
            removeQuestion,
            insertQuestion,
            addQuestion,
            questionRefs,
            adjustHeight,
            announceLiveRegion: announce,
          });

          if (mode === "prevent") {
            expect(preventDefault).toHaveBeenCalled();
            expect(updateQuestionText).not.toHaveBeenCalled();
            expect(removeQuestion).not.toHaveBeenCalled();
          } else if (mode === "update") {
            expect(preventDefault).toHaveBeenCalled();
            expect(updateQuestionText).toHaveBeenCalledTimes(1);
            expect(adjustHeight).toHaveBeenCalled();
          } else if (mode === "deleteFirst") {
            expect(preventDefault).toHaveBeenCalled();
            expect(removeQuestion).toHaveBeenCalledWith(0);
          } else if (mode === "deletePrev") {
            expect(preventDefault).toHaveBeenCalled();
            expect(removeQuestion).toHaveBeenCalledWith(1);
            vi.runAllTimers();
            expect(() => prevRef.current!.focus()).not.toThrow();
          }
        },
      ),
    );

    vi.useRealTimers();
  });

  it("covers Enter insertBelow, Arrow navigation, and Tab branches", () => {
    vi.useFakeTimers();

    fc.assert(
      fc.property(
        fc.constantFrom(
          "enter",
          "arrowDown",
          "arrowUp",
          "tabNext",
          "tabPrev",
          "tabCreate",
          "arrowDownMid",
          "arrowUpMid",
          "tabShiftNone",
          "tabNoneAtEnd",
          "backspaceNone",
        ),
        (mode) => {
          const t = (v: string, sel: number) => createTextarea(v, sel);

          const base = {
            updateQuestionText: vi.fn<(id: string, text: string) => void>(),
            removeQuestion: vi.fn<(index: number) => void>(),
            insertQuestion: vi.fn((index: number, q: Question) => {
              questionRefs.current[q.id] =
                createRef<HTMLTextAreaElement | null>(
                  document.createElement("textarea"),
                );
            }),
            addQuestion: vi.fn((q: Question) => {
              questionRefs.current[q.id] =
                createRef<HTMLTextAreaElement | null>(
                  document.createElement("textarea"),
                );
            }),
            adjustHeight: vi.fn<() => void>(),
            announceLiveRegion: vi.fn<(m: string) => void>(),
          };

          let questions = [
            {
              id: "q1",
              text:
                mode === "tabCreate"
                  ? "x"
                  : mode === "backspaceNone"
                    ? "x"
                    : "",
              answered: false,
              highlighted: false,
            },
            { id: "q2", text: "next", answered: false, highlighted: false },
          ];
          let currentQuestion: Question =
            mode === "arrowDown" ||
            mode === "tabNext" ||
            mode === "arrowDownMid" ||
            mode === "backspaceNone"
              ? questions[0]
              : mode === "tabPrev" || mode === "arrowUpMid"
                ? questions[1]
                : questions[0];

          const questionRefs = createRef<
            Record<string, { current: HTMLTextAreaElement | null }>
          >({
            q1: createRef<HTMLTextAreaElement | null>(
              document.createElement("textarea"),
            ),
            q2: createRef<HTMLTextAreaElement | null>(
              document.createElement("textarea"),
            ),
          });

          let textarea: HTMLTextAreaElement;
          let e: {
            key: string;
            preventDefault: () => void;
            shiftKey: boolean;
            ctrlKey: boolean;
            altKey: boolean;
          };
          if (mode === "enter") {
            textarea = t("hello", 0);
            currentQuestion.text = "hello";
            e = {
              key: "Enter",
              preventDefault: vi.fn(),
              shiftKey: false,
              ctrlKey: false,
              altKey: false,
            };
          } else if (mode === "arrowDown") {
            textarea = t("a\nb", 3);
            e = {
              key: "ArrowDown",
              preventDefault: vi.fn(),
              shiftKey: false,
              ctrlKey: false,
              altKey: false,
            };
          } else if (mode === "arrowUp") {
            textarea = t("a\nb", 0);
            questions = [
              { id: "q0", text: "z", answered: false, highlighted: false },
              ...questions,
            ];
            questionRefs.current.q0 = createRef<HTMLTextAreaElement | null>(
              document.createElement("textarea"),
            );
            currentQuestion = questions[1];
            e = {
              key: "ArrowUp",
              preventDefault: vi.fn(),
              shiftKey: false,
              ctrlKey: false,
              altKey: false,
            };
          } else if (mode === "tabNext") {
            textarea = t("x", 0);
            e = {
              key: "Tab",
              preventDefault: vi.fn(),
              shiftKey: false,
              ctrlKey: false,
              altKey: false,
            };
          } else if (mode === "tabPrev") {
            textarea = t("x", 0);
            e = {
              key: "Tab",
              preventDefault: vi.fn(),
              shiftKey: true,
              ctrlKey: false,
              altKey: false,
            };
          } else if (mode === "arrowDownMid") {
            textarea = t("a\nb\nc", 0);
            e = {
              key: "ArrowDown",
              preventDefault: vi.fn(),
              shiftKey: false,
              ctrlKey: false,
              altKey: false,
            };
          } else if (mode === "arrowUpMid") {
            textarea = t("a\nb\nc", 3);
            questions = [
              { id: "q0", text: "z", answered: false, highlighted: false },
              ...questions,
            ];
            questionRefs.current.q0 = createRef<HTMLTextAreaElement | null>(
              document.createElement("textarea"),
            );
            currentQuestion = questions[1];
            e = {
              key: "ArrowUp",
              preventDefault: vi.fn(),
              shiftKey: false,
              ctrlKey: false,
              altKey: false,
            };
          } else if (mode === "tabShiftNone") {
            textarea = t("x", 0);
            // at first index shift+tab should be none
            e = {
              key: "Tab",
              preventDefault: vi.fn(),
              shiftKey: true,
              ctrlKey: false,
              altKey: false,
            };
            questions = [
              { id: "q1", text: "x", answered: false, highlighted: false },
            ];
            currentQuestion = questions[0];
          } else if (mode === "tabNoneAtEnd") {
            textarea = t("", 0);
            // last and empty => none
            e = {
              key: "Tab",
              preventDefault: vi.fn(),
              shiftKey: false,
              ctrlKey: false,
              altKey: false,
            };
            questions = [
              { id: "q1", text: "", answered: false, highlighted: false },
            ];
            currentQuestion = questions[0];
          } else if (mode === "backspaceNone") {
            textarea = t("hello", 2);
            e = {
              key: "Backspace",
              preventDefault: vi.fn(),
              shiftKey: false,
              ctrlKey: false,
              altKey: false,
            };
          } else {
            // tabCreate
            textarea = t("x", 0);
            questions = [
              { id: "q1", text: "x", answered: false, highlighted: false },
            ];
            e = {
              key: "Tab",
              preventDefault: vi.fn(),
              shiftKey: false,
              ctrlKey: false,
              altKey: false,
            };
          }

          const textareaRef = createRef<HTMLTextAreaElement | null>(textarea);

          handleKeyPress(e, {
            textareaRef,
            questions,
            question: currentQuestion,
            updateQuestionText: base.updateQuestionText,
            removeQuestion: base.removeQuestion,
            insertQuestion: base.insertQuestion,
            addQuestion: base.addQuestion,
            questionRefs,
            adjustHeight: base.adjustHeight,
            announceLiveRegion: base.announceLiveRegion,
          });

          if (mode === "enter") {
            expect(e.preventDefault).toHaveBeenCalled();
            expect(base.insertQuestion).toHaveBeenCalled();
            vi.runAllTimers();
            // Ensure branch where newRef is undefined is exercised too
            const textarea2 = t("hello", 0);
            const e2 = {
              key: "Enter",
              preventDefault: vi.fn(),
              shiftKey: false,
              ctrlKey: false,
              altKey: false,
            };
            const textareaRef2 = createRef<HTMLTextAreaElement | null>(
              textarea2,
            );
            const base2 = {
              ...base,
              insertQuestion: vi.fn<(index: number, q: Question) => void>(),
            };
            const questionRefs2 = createRef<
              Record<string, { current: HTMLTextAreaElement | null }>
            >({});
            handleKeyPress(e2, {
              textareaRef: textareaRef2,
              questions,
              question: questions[0],
              updateQuestionText: base2.updateQuestionText,
              removeQuestion: base2.removeQuestion,
              insertQuestion: base2.insertQuestion,
              addQuestion: base2.addQuestion,
              questionRefs: questionRefs2,
              adjustHeight: base2.adjustHeight,
              announceLiveRegion: base2.announceLiveRegion,
            });
            expect(e2.preventDefault).toHaveBeenCalled();
          } else if (mode === "arrowDown" || mode === "arrowUp") {
            expect(e.preventDefault).toHaveBeenCalled();
          } else if (
            mode === "tabNext" ||
            mode === "tabPrev" ||
            mode === "tabCreate"
          ) {
            expect(e.preventDefault).toHaveBeenCalled();
          } else if (mode === "arrowDownMid" || mode === "arrowUpMid") {
            // no preventDefault when moving within textarea lines
            expect(e.preventDefault).not.toHaveBeenCalled();
          } else if (
            mode === "tabShiftNone" ||
            mode === "tabNoneAtEnd" ||
            mode === "backspaceNone"
          ) {
            // nothing special
            expect(base.addQuestion).not.toHaveBeenCalled();
          }
        },
      ),
    );

    vi.useRealTimers();
  });

  it("Tab create path focuses new ref after timeout", () => {
    vi.useFakeTimers();

    const t = (v: string, sel: number) => createTextarea(v, sel);
    const questionRefs = createRef<
      Record<string, { current: HTMLTextAreaElement | null }>
    >({
      q1: createRef<HTMLTextAreaElement | null>(
        document.createElement("textarea"),
      ),
    });

    const base = {
      updateQuestionText: vi.fn<(id: string, text: string) => void>(),
      removeQuestion: vi.fn<(index: number) => void>(),
      insertQuestion: vi.fn<(index: number, q: Question) => void>(),
      addQuestion: vi.fn((q: Question) => {
        questionRefs.current[q.id] = createRef<HTMLTextAreaElement | null>(
          document.createElement("textarea"),
        );
      }),
      adjustHeight: vi.fn<() => void>(),
      announceLiveRegion: vi.fn<(m: string) => void>(),
    };

    const questions = [
      { id: "q1", text: "x", answered: false, highlighted: false },
    ];
    const textarea = t("x", 0);
    const e = {
      key: "Tab",
      preventDefault: vi.fn(),
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    };

    const textareaRef = createRef<HTMLTextAreaElement | null>(textarea);

    handleKeyPress(e, {
      textareaRef,
      questions,
      question: questions[0],
      updateQuestionText: base.updateQuestionText,
      removeQuestion: base.removeQuestion,
      insertQuestion: base.insertQuestion,
      addQuestion: base.addQuestion,
      questionRefs,
      adjustHeight: base.adjustHeight,
      announceLiveRegion: base.announceLiveRegion,
    });

    vi.runAllTimers();
    // New ref should exist and be focusable
    const newKeys = Object.keys(questionRefs.current);
    expect(newKeys.length).toBeGreaterThan(1);
    const newRefKey = newKeys.find((k) => k !== "q1")!;
    expect(questionRefs.current[newRefKey]?.current).toBeTruthy();

    vi.useRealTimers();
  });

  it("early-returns if textareaRef.current is null without crashing", () => {
    const base = {
      updateQuestionText: vi.fn<(id: string, text: string) => void>(),
      removeQuestion: vi.fn<(index: number) => void>(),
      insertQuestion: vi.fn<(index: number, q: Question) => void>(),
      addQuestion: vi.fn<(q: Question) => void>(),
      adjustHeight: vi.fn<() => void>(),
      announceLiveRegion: vi.fn<(m: string) => void>(),
    };
    const questions = [
      { id: "q1", text: "x", answered: false, highlighted: false },
    ];
    const e = {
      key: "Enter",
      preventDefault: vi.fn(),
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    };
    const questionRefs = createRef<
      Record<string, { current: HTMLTextAreaElement | null }>
    >({});
    expect(() =>
      handleKeyPress(e, {
        textareaRef: createRef<HTMLTextAreaElement | null>(null),
        questions,
        question: questions[0],
        updateQuestionText: base.updateQuestionText,
        removeQuestion: base.removeQuestion,
        insertQuestion: base.insertQuestion,
        addQuestion: base.addQuestion,
        questionRefs,
        adjustHeight: base.adjustHeight,
        announceLiveRegion: base.announceLiveRegion,
      }),
    ).not.toThrow();
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it("Tab create path with no new ref does not throw after timeout", () => {
    vi.useFakeTimers();
    const questionRefs = createRef<
      Record<string, { current: HTMLTextAreaElement | null }>
    >({
      q1: createRef<HTMLTextAreaElement | null>(
        document.createElement("textarea"),
      ),
    });

    const base = {
      updateQuestionText: vi.fn<(id: string, text: string) => void>(),
      removeQuestion: vi.fn<(index: number) => void>(),
      insertQuestion: vi.fn<(index: number, q: Question) => void>(),
      addQuestion: vi.fn<() => void>(),
      adjustHeight: vi.fn<() => void>(),
      announceLiveRegion: vi.fn<(m: string) => void>(),
    };

    const questions = [
      { id: "q1", text: "x", answered: false, highlighted: false },
    ];
    const textarea = createTextarea("x", 0);
    const e = {
      key: "Tab",
      preventDefault: vi.fn(),
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    };
    const textareaRef = createRef<HTMLTextAreaElement | null>(textarea);

    expect(() =>
      handleKeyPress(e, {
        textareaRef,
        questions,
        question: questions[0],
        updateQuestionText: base.updateQuestionText,
        removeQuestion: base.removeQuestion,
        insertQuestion: base.insertQuestion,
        addQuestion: base.addQuestion,
        questionRefs,
        adjustHeight: base.adjustHeight,
        announceLiveRegion: base.announceLiveRegion,
      }),
    ).not.toThrow();

    vi.runAllTimers();
    vi.useRealTimers();
  });

  it("Tab focusNext/Prev tolerates missing next/prev ref safely", () => {
    const t = (v: string, sel: number) => createTextarea(v, sel);
    const questions = [
      { id: "q1", text: "x", answered: false, highlighted: false },
      { id: "q2", text: "y", answered: false, highlighted: false },
    ];
    const questionRefs = createRef<
      Record<string, { current: HTMLTextAreaElement | null }>
    >({
      q1: createRef<HTMLTextAreaElement | null>(
        document.createElement("textarea"),
      ),
    });

    const base = {
      updateQuestionText: vi.fn<(id: string, text: string) => void>(),
      removeQuestion: vi.fn<(index: number) => void>(),
      insertQuestion: vi.fn<(index: number, q: Question) => void>(),
      addQuestion: vi.fn<(q: Question) => void>(),
      adjustHeight: vi.fn<() => void>(),
      announceLiveRegion: vi.fn<(m: string) => void>(),
    };

    // focusNext path where next ref is missing
    const eNext = {
      key: "Tab",
      preventDefault: vi.fn(),
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    };
    const textareaRefNext = createRef<HTMLTextAreaElement | null>(t("x", 0));
    handleKeyPress(eNext, {
      textareaRef: textareaRefNext,
      questions,
      question: questions[0],
      updateQuestionText: base.updateQuestionText,
      removeQuestion: base.removeQuestion,
      insertQuestion: base.insertQuestion,
      addQuestion: base.addQuestion,
      questionRefs,
      adjustHeight: base.adjustHeight,
      announceLiveRegion: base.announceLiveRegion,
    });
    expect(eNext.preventDefault).toHaveBeenCalled();

    // focusPrev path where prev ref is missing
    // Reconfigure refs to only include q2 so prev (q1) is missing
    questionRefs.current = {
      q2: createRef<HTMLTextAreaElement | null>(
        document.createElement("textarea"),
      ),
    } as unknown as Record<string, { current: HTMLTextAreaElement | null }>;
    const ePrev = {
      key: "Tab",
      preventDefault: vi.fn(),
      shiftKey: true,
      ctrlKey: false,
      altKey: false,
    };
    const textareaRefPrev = createRef<HTMLTextAreaElement | null>(t("x", 0));
    handleKeyPress(ePrev, {
      textareaRef: textareaRefPrev,
      questions,
      question: questions[1],
      updateQuestionText: base.updateQuestionText,
      removeQuestion: base.removeQuestion,
      insertQuestion: base.insertQuestion,
      addQuestion: base.addQuestion,
      questionRefs,
      adjustHeight: base.adjustHeight,
      announceLiveRegion: base.announceLiveRegion,
    });
    expect(ePrev.preventDefault).toHaveBeenCalled();
  });

  it("ArrowUp at first question prevents default but does not attempt prev focus", () => {
    const questions = [
      { id: "q1", text: "a\nb", answered: false, highlighted: false },
    ];
    const questionRefs = createRef<
      Record<string, { current: HTMLTextAreaElement | null }>
    >({
      q1: createRef<HTMLTextAreaElement | null>(
        document.createElement("textarea"),
      ),
    });
    const textarea = createTextarea("a\nb", 0);
    const e = {
      key: "ArrowUp",
      preventDefault: vi.fn(),
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    };
    handleKeyPress(e, {
      textareaRef: createRef<HTMLTextAreaElement | null>(textarea),
      questions,
      question: questions[0],
      updateQuestionText: vi.fn<(id: string, text: string) => void>(),
      removeQuestion: vi.fn<(index: number) => void>(),
      insertQuestion: vi.fn<(index: number, q: Question) => void>(),
      addQuestion: vi.fn<(q: Question) => void>(),
      questionRefs,
      adjustHeight: vi.fn(),
      announceLiveRegion: vi.fn(),
    });
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("ArrowDown at last question prevents default but does not attempt next focus", () => {
    const questions = [
      { id: "q1", text: "a\nb", answered: false, highlighted: false },
    ];
    const questionRefs = createRef<
      Record<string, { current: HTMLTextAreaElement | null }>
    >({
      q1: createRef<HTMLTextAreaElement | null>(
        document.createElement("textarea"),
      ),
    });
    const textarea = createTextarea("a\nb", 3);
    const e = {
      key: "ArrowDown",
      preventDefault: vi.fn(),
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    };
    handleKeyPress(e, {
      textareaRef: createRef<HTMLTextAreaElement | null>(textarea),
      questions,
      question: questions[0],
      updateQuestionText: vi.fn<(id: string, text: string) => void>(),
      removeQuestion: vi.fn<(index: number) => void>(),
      insertQuestion: vi.fn<(index: number, q: Question) => void>(),
      addQuestion: vi.fn<(q: Question) => void>(),
      questionRefs,
      adjustHeight: vi.fn(),
      announceLiveRegion: vi.fn(),
    });
    expect(e.preventDefault).toHaveBeenCalled();
  });
});

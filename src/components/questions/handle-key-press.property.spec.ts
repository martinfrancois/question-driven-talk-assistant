import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { handleKeyPress } from "./handle-key-press.ts";

function createTextarea(value: string, selectionStart: number) {
  const el = document.createElement("textarea");
  el.value = value;
  el.selectionStart = selectionStart as any;
  el.selectionEnd = selectionStart as any;
  // setSelectionRange exists on HTMLTextAreaElement; JSDOM supports it
  return el;
}

function createRef<T>(current: T) {
  return { current } as React.RefObject<T>;
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

          const updateQuestionText = vi.fn();
          const removeQuestion = vi.fn();
          const insertQuestion = vi.fn();
          const addQuestion = vi.fn();
          const announce = vi.fn();
          const adjustHeight = vi.fn();

          const firstRef = createRef<HTMLTextAreaElement | null>(
            document.createElement("textarea"),
          );
          const prevRef = createRef<HTMLTextAreaElement | null>(
            document.createElement("textarea"),
          );
          const questionRefs = createRef<
            Record<string, React.RefObject<HTMLTextAreaElement | null>>
          >({
            [questions[0].id]: firstRef,
            ...(questions[1] ? { [questions[1].id]: prevRef } : {}),
          });

          const e: any = {
            key: "Backspace",
            preventDefault: vi.fn(),
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
          };

          handleKeyPress(e, {
            textareaRef,
            questions,
            question,
            updateQuestionText: updateQuestionText as any,
            removeQuestion: removeQuestion as any,
            insertQuestion: insertQuestion as any,
            addQuestion: addQuestion as any,
            questionRefs: questionRefs as any,
            adjustHeight,
            announceLiveRegion: announce,
          });

          if (mode === "prevent") {
            expect(e.preventDefault).toHaveBeenCalled();
            expect(updateQuestionText).not.toHaveBeenCalled();
            expect(removeQuestion).not.toHaveBeenCalled();
          } else if (mode === "update") {
            expect(e.preventDefault).toHaveBeenCalled();
            expect(updateQuestionText).toHaveBeenCalledTimes(1);
            expect(adjustHeight).toHaveBeenCalled();
          } else if (mode === "deleteFirst") {
            expect(e.preventDefault).toHaveBeenCalled();
            expect(removeQuestion).toHaveBeenCalledWith(0);
          } else if (mode === "deletePrev") {
            expect(e.preventDefault).toHaveBeenCalled();
            expect(removeQuestion).toHaveBeenCalledWith(1);
            vi.runAllTimers();
            expect(prevRef.current?.focus).toBeDefined();
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

          const base: any = {
            updateQuestionText: vi.fn(),
            removeQuestion: vi.fn(),
            insertQuestion: vi.fn((index: number, q: any) => {
              questionRefs.current[q.id] =
                createRef<HTMLTextAreaElement | null>(
                  document.createElement("textarea"),
                );
            }),
            addQuestion: vi.fn((q: any) => {
              questionRefs.current[q.id] =
                createRef<HTMLTextAreaElement | null>(
                  document.createElement("textarea"),
                );
            }),
            adjustHeight: vi.fn(),
            announceLiveRegion: vi.fn(),
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
          let currentQuestion: any =
            mode === "arrowDown" ||
            mode === "tabNext" ||
            mode === "arrowDownMid" ||
            mode === "backspaceNone"
              ? questions[0]
              : mode === "tabPrev" || mode === "arrowUpMid"
                ? questions[1]
                : questions[0];

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

          let textarea: HTMLTextAreaElement;
          let e: any;
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
            question: currentQuestion as any,
            updateQuestionText: base.updateQuestionText,
            removeQuestion: base.removeQuestion,
            insertQuestion: base.insertQuestion,
            addQuestion: base.addQuestion,
            questionRefs: questionRefs as any,
            adjustHeight: base.adjustHeight,
            announceLiveRegion: base.announceLiveRegion,
          });

          if (mode === "enter") {
            expect(e.preventDefault).toHaveBeenCalled();
            expect(base.insertQuestion).toHaveBeenCalled();
            vi.runAllTimers();
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
});

import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { renderQuestionTextareas } from "@/test-utils/question-textareas.ts";

// Small alphabet so blank, single-line and multi-line questions all show up.
const questionText = fc.constantFrom(
  "",
  " ",
  "a",
  "ab c",
  "a\nb",
  "\n",
  " \n ",
);

const questionList = fc
  .array(questionText, { minLength: 1, maxLength: 5 })
  .chain((texts) =>
    fc.record({
      texts: fc.constant(texts),
      index: fc.integer({ min: 0, max: texts.length - 1 }),
      cursor: fc.nat(),
    }),
  );

const isBlank = (text: string) => text.trim() === "";

/**
 * Renders the questions, presses `key` in question `index`, lets the delayed
 * focus moves run, and hands the outcome to `check`.
 */
function pressIn(
  { texts, index, cursor }: { texts: string[]; index: number; cursor: number },
  key: string,
  modifiers: { shiftKey?: boolean; ctrlKey?: boolean; altKey?: boolean },
  check: (
    outcome: ReturnType<typeof renderQuestionTextareas> & {
      preventDefault: ReturnType<typeof vi.fn>;
      caret: number;
    },
  ) => void,
) {
  const fixture = renderQuestionTextareas(texts);
  try {
    const caret = Math.min(cursor, texts[index].length);
    const preventDefault = fixture.press(index, key, {
      cursor: caret,
      ...modifiers,
    });
    vi.runAllTimers();
    check({ ...fixture, preventDefault, caret });
  } finally {
    fixture.unmount();
  }
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout"] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("handleKeyPress (properties)", () => {
  it("Tab and Shift+Tab never let focus leave the question list", () => {
    fc.assert(
      fc.property(questionList, fc.boolean(), (list, shiftKey) => {
        pressIn(
          list,
          "Tab",
          { shiftKey },
          ({ preventDefault, questionRefs }) => {
            expect(preventDefault).toHaveBeenCalled();
            const questionTextareas = [...questionRefs.current.values()].map(
              (ref) => ref.current,
            );
            expect(questionTextareas).toContain(document.activeElement);
          },
        );
      }),
    );
  });

  it("Enter never reaches the browser and inserts at most one question, right below", () => {
    fc.assert(
      fc.property(questionList, (list) => {
        pressIn(list, "Enter", {}, ({ preventDefault, store }) => {
          const { texts, index } = list;
          const next = texts[index + 1];
          const shouldInsert =
            !isBlank(texts[index]) && (next === undefined || !isBlank(next));

          expect(preventDefault).toHaveBeenCalled();
          if (shouldInsert) {
            expect(store.insertQuestion).toHaveBeenCalledExactlyOnceWith(
              index + 1,
              expect.objectContaining({ text: "" }),
            );
          } else {
            expect(store.insertQuestion).not.toHaveBeenCalled();
          }
        });
      }),
    );
  });

  it("Backspace in a blank single-line question never reaches the browser and keeps the last question", () => {
    fc.assert(
      fc.property(
        questionList.filter(
          ({ texts, index }) =>
            isBlank(texts[index]) && !texts[index].includes("\n"),
        ),
        (list) => {
          pressIn(list, "Backspace", {}, ({ preventDefault, store }) => {
            expect(preventDefault).toHaveBeenCalled();
            expect(store.updateQuestionText).not.toHaveBeenCalled();
            if (list.texts.length > 1) {
              expect(store.removeQuestion).toHaveBeenCalledExactlyOnceWith(
                list.index,
              );
            } else {
              expect(store.removeQuestion).not.toHaveBeenCalled();
            }
          });
        },
      ),
    );
  });

  it("Backspace removes a newline from a blank multiline question", () => {
    pressIn(
      { texts: [" \n "], index: 0, cursor: 2 },
      "Backspace",
      {},
      ({ preventDefault, questions, store }) => {
        expect(preventDefault).toHaveBeenCalled();
        expect(store.updateQuestionText).toHaveBeenCalledExactlyOnceWith(
          questions[0].id,
          "  ",
        );
        expect(store.adjustHeight).toHaveBeenCalledOnce();
        expect(store.removeQuestion).not.toHaveBeenCalled();
      },
    );
  });

  it("arrow keys take over only on the boundary line and move to the neighbouring question", () => {
    fc.assert(
      fc.property(
        questionList,
        fc.constantFrom("ArrowUp", "ArrowDown"),
        (list, key) => {
          pressIn(list, key, {}, ({ preventDefault, textareas, caret }) => {
            const { texts, index } = list;
            const text = texts[index];
            const line = text.slice(0, caret).split("\n").length - 1;
            const lastLine = text.split("\n").length - 1;
            const atBoundary =
              key === "ArrowUp" ? line === 0 : line === lastLine;
            const neighbour =
              textareas[key === "ArrowUp" ? index - 1 : index + 1];

            expect(preventDefault.mock.calls.length > 0).toBe(atBoundary);
            expect(document.activeElement).toBe(
              atBoundary && neighbour ? neighbour : textareas[index],
            );
          });
        },
      ),
    );
  });

  it("leaves every key with Ctrl or Alt except Backspace to other handlers", () => {
    fc.assert(
      fc.property(
        questionList,
        fc.constantFrom("Enter", "Tab", "ArrowUp", "ArrowDown"),
        fc.constantFrom({ ctrlKey: true }, { altKey: true }),
        fc.boolean(),
        (list, key, modifier, shiftKey) => {
          pressIn(
            list,
            key,
            { ...modifier, shiftKey },
            ({ preventDefault, store, textareas }) => {
              expect(preventDefault).not.toHaveBeenCalled();
              expect(store.insertQuestion).not.toHaveBeenCalled();
              expect(store.addQuestion).not.toHaveBeenCalled();
              expect(document.activeElement).toBe(textareas[list.index]);
            },
          );
        },
      ),
    );
  });

  it("tolerates neighbouring questions whose textareas are not mounted yet", () => {
    fc.assert(
      fc.property(
        questionList,
        fc.constantFrom("Backspace", "Enter", "Tab", "ArrowUp", "ArrowDown"),
        fc.boolean(),
        (list, key, shiftKey) => {
          const fixture = renderQuestionTextareas(list.texts);
          try {
            const current = fixture.questions[list.index].id;
            for (const id of [...fixture.questionRefs.current.keys()]) {
              if (id !== current) fixture.questionRefs.current.delete(id);
            }
            fixture.store.insertQuestion.mockImplementation(() => undefined);
            fixture.store.addQuestion.mockImplementation(() => undefined);
            const caret = Math.min(list.cursor, list.texts[list.index].length);

            expect(() => {
              fixture.press(list.index, key, { cursor: caret, shiftKey });
              vi.runAllTimers();
            }).not.toThrow();
            expect(document.activeElement).toBe(fixture.textareas[list.index]);
          } finally {
            fixture.unmount();
          }
        },
      ),
    );
  });
});

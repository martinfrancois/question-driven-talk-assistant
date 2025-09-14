import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  decideBackspaceAction,
  decideEnterAction,
  decideTabAction,
  type BackspaceAction,
  type EnterAction,
  type TabAction,
} from "./question-keypress.ts";

describe("question-keypress decisions (properties)", () => {
  it("decideBackspaceAction returns prevent on first line when multiline empty", () => {
    fc.assert(
      fc.property(
        fc.record({
          textareaValue: fc.string(),
          currentIndex: fc.integer({ min: 0, max: 10 }),
          questionsLength: fc.integer({ min: 1, max: 10 }),
        }),
        ({ textareaValue, currentIndex, questionsLength }) => {
          const action = decideBackspaceAction({
            textareaValue,
            cursorPosition: 0,
            isCurrentTextEmpty: false,
            isMultiLineAndEmpty: true,
            currentIndex,
            questionsLength,
          });
          expect(action).toEqual({ type: "prevent" });
        },
      ),
    );
  });

  it("decideBackspaceAction updates text when multiline empty and cursor > 0", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.integer({ min: 1, max: 50 }),
        (textareaValue, cursorPosition) => {
          const action = decideBackspaceAction({
            textareaValue,
            cursorPosition,
            isCurrentTextEmpty: false,
            isMultiLineAndEmpty: true,
            currentIndex: 0,
            questionsLength: 2,
          }) as Extract<BackspaceAction, { type: "updateText" }>;
          expect(action.type).toBe("updateText");
          // Ensure one character was removed at cursor-1
          const expected =
            textareaValue.slice(0, cursorPosition - 1) +
            textareaValue.slice(cursorPosition);
          expect(action.newText).toBe(expected);
        },
      ),
    );
  });

  it("decideBackspaceAction deletes question when empty and multiple questions", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 2, max: 8 }),
        (currentIndex, questionsLength) => {
          const action = decideBackspaceAction({
            textareaValue: "",
            cursorPosition: 0,
            isCurrentTextEmpty: true,
            isMultiLineAndEmpty: false,
            currentIndex,
            questionsLength,
          });

          if (currentIndex === 0) {
            expect(action).toEqual({
              type: "deleteQuestion",
              target: "firstNext",
            });
          } else if (currentIndex < questionsLength) {
            expect(action).toEqual({ type: "deleteQuestion", target: "prev" });
          } else {
            // Out-of-range index is not expected by production code; ensure it does not throw
            expect(["deleteQuestion", "none"]).toContain(action.type);
          }
        },
      ),
    );
  });

  it("decideBackspaceAction returns none otherwise", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.integer({ min: 0, max: 100 }),
        (textareaValue, cursorPosition) => {
          const action = decideBackspaceAction({
            textareaValue,
            cursorPosition,
            isCurrentTextEmpty: false,
            isMultiLineAndEmpty: false,
            currentIndex: 0,
            questionsLength: 1,
          });
          expect(action).toEqual({ type: "none" });
        },
      ),
    );
  });

  it("decideEnterAction inserts below only when current non-empty and next missing or non-empty", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.boolean(),
        fc.option(fc.string(), { nil: null }),
        (text, hasNext, nextText) => {
          const currentTextTrimmed = text.trim();
          const nextTextTrimmed = nextText ?? null;
          const action: EnterAction = decideEnterAction({
            currentTextTrimmed,
            hasNext,
            nextTextTrimmed,
          });

          const shouldInsert =
            currentTextTrimmed !== "" &&
            (!hasNext || (nextTextTrimmed ?? "").trim() !== "");
          expect(action.type).toBe(
            shouldInsert ? "insertBelow" : "preventOnly",
          );
        },
      ),
    );
  });

  it("decideTabAction respects shiftKey, edges and creation rule", () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 1, max: 11 }),
        fc.boolean(),
        (shiftKey, currentIndex, questionsLength, isCurrentEmpty) => {
          const clampedIndex = Math.min(currentIndex, questionsLength - 1);
          const action: TabAction = decideTabAction({
            shiftKey,
            currentIndex: clampedIndex,
            questionsLength,
            isCurrentEmpty,
          });

          if (shiftKey) {
            if (clampedIndex > 0) expect(action.type).toBe("focusPrev");
            else expect(action.type).toBe("none");
          } else if (clampedIndex < questionsLength - 1) {
            expect(action.type).toBe("focusNext");
          } else if (!isCurrentEmpty) {
            expect(action.type).toBe("createNewAndFocus");
          } else {
            expect(action.type).toBe("none");
          }
        },
      ),
    );
  });
});

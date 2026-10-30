import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { getCheckboxState } from "./get-checkbox-state.ts";
import type { Question } from "@/stores";

describe("getCheckboxState", () => {
  it("returns consistent messages based on question state (property)", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string(),
          text: fc.string(),
          answered: fc.boolean(),
          highlighted: fc.boolean(),
        }),
        (q) => {
          const question: Question = q;
          const expected = question.answered
            ? question.text.trim()
              ? `Answered question: ${question.text}`
              : "Answered empty question"
            : question.highlighted
              ? question.text.trim()
                ? `Currently answering question: ${question.text}`
                : "Currently answering empty question"
              : question.text.trim()
                ? `Question: ${question.text}`
                : "Empty Question";

          expect(getCheckboxState(question)).toBe(expected);
        },
      ),
    );
  });
});

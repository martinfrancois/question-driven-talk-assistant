import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
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
          const question = q as Question;
          const expected = question.answered
            ? question.text
              ? `Answered question: ${question.text}`
              : "Answered empty question"
            : question.highlighted
              ? question.text
                ? `Currently answering question: ${question.text}`
                : "Currently answering empty question"
              : question.text
                ? `Question: ${question.text}`
                : "Empty Question";

          expect(getCheckboxState(question)).toBe(expected);
        },
      ),
    );
  });
});

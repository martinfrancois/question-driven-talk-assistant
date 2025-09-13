import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { getCheckboxState } from "./get-checkbox-state.ts";
import type { Question } from "@/stores";

describe("getCheckboxState", () => {
  it("returns consistent messages based on question state", () => {
    const samples = fc.sample(
      fc.record({
        id: fc.string(),
        text: fc.string(),
        answered: fc.boolean(),
        highlighted: fc.boolean(),
      }),
      100,
    );

    for (const q of [
      { id: "1", text: "", answered: true, highlighted: false },
      { id: "2", text: "", answered: false, highlighted: true },
      { id: "3", text: "", answered: false, highlighted: false },
      { id: "4", text: "t", answered: true, highlighted: true },
      ...samples,
    ]) {
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
    }
  });
});

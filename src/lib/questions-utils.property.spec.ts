import { describe, it, expect } from "vitest";
import fc from "fast-check";
import type { Question } from "@/stores";
import { reorderQuestionsByIds } from "./questions-utils.ts";

// Ids are unique and non-empty, as createEmptyQuestion's UUIDs are.
const questionsArb = (minLength: number) =>
  fc.uniqueArray(
    fc.record<Question>({
      id: fc.string({ minLength: 1 }),
      text: fc.string(),
      answered: fc.boolean(),
      highlighted: fc.boolean(),
    }),
    { selector: (q) => q.id, minLength, maxLength: 12 },
  );

/** A list with two distinct positions in it. */
const moveArb = questionsArb(2).chain((questions) =>
  fc
    .tuple(
      fc.constant(questions),
      fc.nat({ max: questions.length - 1 }),
      fc.nat({ max: questions.length - 1 }),
    )
    .filter(([, from, to]) => from !== to),
);

describe("questions-utils (properties)", () => {
  it("moves the dragged question to the drop position and keeps the others in order", () => {
    fc.assert(
      fc.property(moveArb, ([questions, from, to]) => {
        const result = reorderQuestionsByIds(
          questions,
          questions[from].id,
          questions[to].id,
        );

        const others = questions.filter((_, i) => i !== from);
        const expected = [
          ...others.slice(0, to),
          questions[from],
          ...others.slice(to),
        ];
        expect(result).toEqual(expected);
      }),
    );
  });

  it("returns the same list when the drag ends over nothing", () => {
    fc.assert(
      fc.property(
        questionsArb(1),
        fc.constantFrom(null, undefined),
        (questions, overId) => {
          expect(
            reorderQuestionsByIds(questions, questions[0].id, overId),
          ).toBe(questions);
        },
      ),
    );
  });

  it("returns the same list when a question is dropped on itself", () => {
    fc.assert(
      fc.property(questionsArb(1), (questions) => {
        const id = questions[0].id;
        expect(reorderQuestionsByIds(questions, id, id)).toBe(questions);
      }),
    );
  });

  it("returns the same list when either id is not in it", () => {
    fc.assert(
      fc.property(
        questionsArb(1),
        fc.string({ minLength: 1 }),
        fc.boolean(),
        (questions, unknownId, activeIsUnknown) => {
          fc.pre(!questions.some((q) => q.id === unknownId));
          const knownId = questions[0].id;
          const result = activeIsUnknown
            ? reorderQuestionsByIds(questions, unknownId, knownId)
            : reorderQuestionsByIds(questions, knownId, unknownId);
          expect(result).toBe(questions);
        },
      ),
    );
  });
});

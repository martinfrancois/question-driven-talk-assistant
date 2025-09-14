import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { reorderQuestionsByIds } from "./questions-utils.ts";

interface Question {
  id: string;
  text: string;
  answered: boolean;
  highlighted: boolean;
}

describe("questions-utils (properties)", () => {
  it("reorderQuestionsByIds is a stable permutation and only moves active to over index", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            text: fc.string(),
            answered: fc.boolean(),
            highlighted: fc.boolean(),
          }),
          { minLength: 0, maxLength: 12 },
        ),
        fc.string(),
        fc.option(fc.string(), { nil: null }),
        (arr, activeId, overId) => {
          const questions = arr as Question[];
          const result = reorderQuestionsByIds(questions, activeId, overId);

          if (!overId || activeId === overId) {
            expect(result).toBe(questions); // same reference per implementation
            return;
          }

          // If either index not found, no changes
          const oldIndex = questions.findIndex((q) => q.id === activeId);
          const newIndex = questions.findIndex((q) => q.id === overId);
          if (oldIndex === -1 || newIndex === -1) {
            expect(result).toBe(questions);
            return;
          }

          // Same length and is a permutation of original
          expect(result.length).toBe(questions.length);
          const multiset = (xs: Question[]) =>
            xs
              .map((q) => q.id)
              .sort()
              .join("|");
          expect(multiset(result)).toBe(multiset(questions));

          // The moved element equals the original active element
          expect(result[newIndex]).toEqual(questions[oldIndex]);

          // All other elements preserve relative order
          const withoutActive = questions.filter((_, i) => i !== oldIndex);
          const resultWithoutMoved = result.filter((_, i) => i !== newIndex);
          expect(resultWithoutMoved).toEqual(withoutActive);
        },
      ),
    );
  });

  it("returns identity when overId is null/undefined", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            text: fc.string(),
            answered: fc.boolean(),
            highlighted: fc.boolean(),
          }),
          { maxLength: 8 },
        ),
        fc.string(),
        (arr, activeId) => {
          const qs = arr as Question[];
          expect(reorderQuestionsByIds(qs, activeId, null)).toBe(qs);
          expect(reorderQuestionsByIds(qs, activeId, undefined)).toBe(qs);
        },
      ),
    );
  });

  it("returns identity when activeId equals overId", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            text: fc.string(),
            answered: fc.boolean(),
            highlighted: fc.boolean(),
          }),
          { minLength: 1, maxLength: 8 },
        ),
        (arr) => {
          const qs = arr as Question[];
          const id = qs[0].id;
          expect(reorderQuestionsByIds(qs, id, id)).toBe(qs);
        },
      ),
    );
  });

  it("returns identity when activeId not found but overId exists", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            text: fc.string(),
            answered: fc.boolean(),
            highlighted: fc.boolean(),
          }),
          { minLength: 1, maxLength: 8 },
        ),
        fc.string().filter((s) => s.length > 0),
        (arr, activeId) => {
          const qs = arr as Question[];
          const overId = qs[0].id;
          // Ensure activeId is not present
          fc.pre(!qs.some((q) => q.id === activeId));
          expect(reorderQuestionsByIds(qs, activeId, overId)).toBe(qs);
        },
      ),
    );
  });

  it("returns identity when overId not found but activeId exists", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            text: fc.string(),
            answered: fc.boolean(),
            highlighted: fc.boolean(),
          }),
          { minLength: 1, maxLength: 8 },
        ),
        fc.string().filter((s) => s.length > 0),
        (arr, overId) => {
          const qs = arr as Question[];
          const activeId = qs[0].id;
          // Ensure overId is not present
          fc.pre(!qs.some((q) => q.id === overId));
          expect(reorderQuestionsByIds(qs, activeId, overId)).toBe(qs);
        },
      ),
    );
  });

  it("moves when both activeId and overId exist (hit move branch)", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            text: fc.string(),
            answered: fc.boolean(),
            highlighted: fc.boolean(),
          }),
          { minLength: 2, maxLength: 12 },
        ),
        (arr) => {
          const qs = (arr as Question[]).map((q) => ({ ...q }));
          // Force non-empty distinct ids for boundary indices to avoid falsy overId
          const oldIndex = 0;
          const newIndex = qs.length - 1;
          qs[oldIndex].id = "active-id";
          qs[newIndex].id = "over-id";
          const result = reorderQuestionsByIds(
            qs,
            qs[oldIndex].id,
            qs[newIndex].id,
          );
          expect(result[newIndex]).toEqual(qs[oldIndex]);
        },
      ),
    );
  });
});

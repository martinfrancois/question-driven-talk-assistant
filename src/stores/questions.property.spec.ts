import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { renderHook, act } from "@testing-library/react";

vi.mock("zustand/middleware", async () => {
  const actual =
    await vi.importActual<typeof import("zustand/middleware")>(
      "zustand/middleware",
    );
  return {
    ...actual,
    persist: <T>(fn: T) => fn,
    devtools: <T>(fn: T) => fn,
  } satisfies typeof import("zustand/middleware");
});

describe("questions store (properties)", () => {
  it("setQuestions replaces list and updateQuestionText mutates by id", async () => {
    const {
      useQuestions,
      useSetQuestions,
      useUpdateQuestionText,
      useInsertQuestion,
      useAddQuestion,
      useRemoveQuestion,
      useMoveQuestionUp,
      useMoveQuestionDown,
      useClickCheckbox,
      useClearQuestions,
      createEmptyQuestion,
    } = await import("./questions.ts");

    const { result } = renderHook(() => {
      const qs = useQuestions();
      const setQs = useSetQuestions();
      const upd = useUpdateQuestionText();
      const insert = useInsertQuestion();
      const add = useAddQuestion();
      const remove = useRemoveQuestion();
      const up = useMoveQuestionUp();
      const down = useMoveQuestionDown();
      const toggle = useClickCheckbox();
      const clear = useClearQuestions();
      return { qs, setQs, upd, insert, add, remove, up, down, toggle, clear };
    });

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
        (arr, newText) => {
          const base = arr.length ? arr : [createEmptyQuestion()];
          act(() => result.current.setQs(base));

          if (result.current.qs.length > 0) {
            const first = result.current.qs[0];
            act(() => result.current.upd(first.id, newText));
            expect(result.current.qs[0].text).toBe(newText);
          }

          const inserted = createEmptyQuestion();
          act(() => result.current.insert(0, inserted));
          expect(result.current.qs[0].id).toBe(inserted.id);

          const added = createEmptyQuestion();
          act(() => result.current.add(added));
          expect(result.current.qs[result.current.qs.length - 1].id).toBe(
            added.id,
          );

          if (result.current.qs.length >= 3) {
            act(() => result.current.down(1));
            act(() => result.current.up(2));
          }

          const countBefore = result.current.qs.filter(
            (x) => x.id === inserted.id,
          ).length;
          act(() => result.current.remove(0));
          const countAfter = result.current.qs.filter(
            (x) => x.id === inserted.id,
          ).length;
          expect(countAfter).toBeLessThan(countBefore);

          if (result.current.qs.length > 0) {
            const before = result.current.qs[0];
            const id = before.id;
            act(() => result.current.toggle(id));
            const after = result.current.qs.find((x) => x.id === id)!;
            if (before.answered) {
              expect(after.answered).toBe(false);
            } else if (!before.highlighted) {
              expect(after.highlighted).toBe(true);
            } else {
              expect(after.answered).toBe(true);
              expect(after.highlighted).toBe(false);
            }
          }

          act(() => result.current.upd("__missing__", newText));
          act(() => result.current.toggle("__missing__"));

          act(() => result.current.clear());
          expect(result.current.qs.length).toBeGreaterThanOrEqual(1);
        },
      ),
    );
  });
});

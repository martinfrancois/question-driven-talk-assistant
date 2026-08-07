import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { renderHook, act } from "@testing-library/react";
import QuestionList from "./QuestionList.tsx";
import { StorageName, useQuestions, useSetQuestions } from "@/stores";
import { keyDown } from "@/test-utils/keyboard.ts";
import { interact } from "@/test-utils/react.ts";

/**
 * Exercises the real `@dnd-kit` stack: `DndContext`, `SortableContext`, the
 * keyboard sensor with `sortableKeyboardCoordinates`, and `arrayMove`. The
 * reorder is performed by driving dnd-kit's real keyboard drag protocol, so a
 * breaking change in dnd-kit fails this test instead of slipping through.
 */
describe("QuestionList", () => {
  beforeEach(() => {
    localStorage.removeItem(StorageName.QUESTIONS);
  });

  const questionsHook = () =>
    renderHook(() => ({
      questions: useQuestions(),
      setQuestions: useSetQuestions(),
    }));

  const renderList = async () => {
    const hook = questionsHook();
    act(() => {
      hook.result.current.setQuestions([
        { id: "a", text: "Alpha", answered: false, highlighted: false },
        { id: "b", text: "Bravo", answered: false, highlighted: false },
        { id: "c", text: "Charlie", answered: false, highlighted: false },
      ]);
    });
    const rendered = await render(<QuestionList />);
    return { ...rendered, hook };
  };

  const texts = (container: HTMLElement): string[] =>
    Array.from(container.querySelectorAll("textarea")).map((t) => t.value);

  it("renders one list item per question, in store order", async () => {
    const { container } = await renderList();

    expect(container.querySelectorAll("[role='listitem']")).toHaveLength(3);
    expect(texts(container)).toEqual(["Alpha", "Bravo", "Charlie"]);
  });

  it("gives every question its own textarea id for the skip link", async () => {
    const { container } = await renderList();

    const ids = Array.from(container.querySelectorAll("textarea")).map(
      (t) => t.id,
    );
    expect(ids).toEqual([
      "question-text-0",
      "question-text-1",
      "question-text-2",
    ]);
  });

  it("re-renders in the new order when the store changes", async () => {
    const { container, hook } = await renderList();

    await interact(() => {
      hook.result.current.setQuestions([
        { id: "c", text: "Charlie", answered: false, highlighted: false },
        { id: "a", text: "Alpha", answered: false, highlighted: false },
        { id: "b", text: "Bravo", answered: false, highlighted: false },
      ]);
    });

    expect(texts(container)).toEqual(["Charlie", "Alpha", "Bravo"]);
  });

  it("reorders the store when a question is dragged down with the keyboard", async () => {
    const { container, hook } = await renderList();

    const handles = container.querySelectorAll<HTMLElement>(
      "[data-testid='reorder-button']",
    );
    const first = handles[0];

    // dnd-kit's keyboard sensor: Space picks the item up, an arrow key moves
    // it, Space drops it and fires onDragEnd.
    await interact(() => {
      first.focus();
      keyDown({ key: " ", code: "Space", target: first });
    });
    await interact(() => {
      keyDown({ key: "ArrowDown", code: "ArrowDown", target: first });
    });
    await interact(() => {
      keyDown({ key: " ", code: "Space", target: first });
    });

    await vi.waitFor(() => {
      if (hook.result.current.questions[0].id !== "b") {
        throw new Error(
          `order is ${hook.result.current.questions.map((q) => q.id).join(",")}`,
        );
      }
    });

    expect(hook.result.current.questions.map((q) => q.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
    expect(texts(container)).toEqual(["Bravo", "Alpha", "Charlie"]);
  });

  it("leaves the order alone when a drag is cancelled", async () => {
    const { hook } = await renderList();
    const { container } = await render(<QuestionList />);

    const first = container.querySelector<HTMLElement>(
      "[data-testid='reorder-button']",
    );
    if (!first) throw new Error("reorder handle not rendered");

    await interact(() => {
      first.focus();
      keyDown({ key: " ", code: "Space", target: first });
    });
    await interact(() => {
      keyDown({ key: "ArrowDown", code: "ArrowDown", target: first });
    });
    await interact(() => {
      keyDown({ key: "Escape", code: "Escape", target: first });
    });

    expect(hook.result.current.questions.map((q) => q.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("publishes a live region for dnd-kit's drag announcements", async () => {
    await renderList();

    const liveRegion = document.body.querySelector("[id^='DndLiveRegion-']");
    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.getAttribute("role")).toBe("status");
  });
});

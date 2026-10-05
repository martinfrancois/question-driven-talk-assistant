import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleKeyPress } from "./handle-key-press.ts";
import { renderQuestionTextareas } from "@/test-utils/question-textareas.ts";

let fixture: ReturnType<typeof renderQuestionTextareas> | undefined;
const render = (texts: string[]) => {
  fixture = renderQuestionTextareas(texts);
  return fixture;
};

beforeEach(() => {
  // Focus moves to inserted or previous questions in a setTimeout.
  vi.useFakeTimers({ toFake: ["setTimeout"] });
});

afterEach(() => {
  fixture?.unmount();
  fixture = undefined;
  vi.useRealTimers();
});

const caretOf = (textarea: HTMLTextAreaElement | null | undefined) => [
  textarea?.selectionStart,
  textarea?.selectionEnd,
];

describe("handleKeyPress", () => {
  describe("Backspace", () => {
    it("on the first line of a blank multi-line question blocks the key", () => {
      const { press, store } = render(["a", "\n\n"]);

      const preventDefault = press(1, "Backspace", { cursor: 0 });

      expect(preventDefault).toHaveBeenCalled();
      expect(store.updateQuestionText).not.toHaveBeenCalled();
      expect(store.removeQuestion).not.toHaveBeenCalled();
    });

    it("on a later line of a blank multi-line question removes one line break", () => {
      const { press, store } = render(["\n\n"]);

      const preventDefault = press(0, "Backspace", { cursor: 2 });

      expect(preventDefault).toHaveBeenCalled();
      expect(store.updateQuestionText).toHaveBeenCalledExactlyOnceWith(
        "q0",
        "\n",
      );
      expect(store.adjustHeight).toHaveBeenCalledOnce();
    });

    it("on a blank first question deletes it and focuses the next one at its start", () => {
      const { press, store, textareas } = render(["", "next"]);

      const preventDefault = press(0, "Backspace");

      expect(preventDefault).toHaveBeenCalled();
      expect(store.removeQuestion).toHaveBeenCalledExactlyOnceWith(0);
      expect(document.activeElement).toBe(textareas[1]);
      expect(caretOf(textareas[1])).toEqual([0, 0]);
      expect(store.announceLiveRegion).toHaveBeenCalledWith(
        "First question was deleted.",
      );
    });

    it("on a blank later question deletes it and focuses the previous one at its end", () => {
      const { press, store, textareas } = render(["previous", "  "]);

      const preventDefault = press(1, "Backspace");
      vi.runAllTimers();

      expect(preventDefault).toHaveBeenCalled();
      expect(store.removeQuestion).toHaveBeenCalledExactlyOnceWith(1);
      expect(document.activeElement).toBe(textareas[0]);
      expect(caretOf(textareas[0])).toEqual([8, 8]);
      expect(store.announceLiveRegion).toHaveBeenCalledWith(
        "Deleted question.",
      );
    });

    it("on the only question, when blank, blocks the key and keeps the question", () => {
      const { press, store } = render(["  "]);

      const preventDefault = press(0, "Backspace");

      expect(preventDefault).toHaveBeenCalled();
      expect(store.removeQuestion).not.toHaveBeenCalled();
      expect(store.updateQuestionText).not.toHaveBeenCalled();
    });

    it("in a question with text leaves the key to the browser", () => {
      const { press, store } = render(["hello", ""]);

      const preventDefault = press(0, "Backspace", { cursor: 2 });

      expect(preventDefault).not.toHaveBeenCalled();
      expect(store.updateQuestionText).not.toHaveBeenCalled();
      expect(store.removeQuestion).not.toHaveBeenCalled();
    });
  });

  describe("Enter", () => {
    it("below a question with text inserts an empty question and focuses it", () => {
      const { press, store, createdTextareaFor } = render(["one", "two"]);

      const preventDefault = press(0, "Enter");
      vi.runAllTimers();

      expect(preventDefault).toHaveBeenCalled();
      expect(store.insertQuestion).toHaveBeenCalledExactlyOnceWith(
        1,
        expect.objectContaining({ text: "", answered: false }),
      );
      const inserted = createdTextareaFor(
        store.insertQuestion.mock.calls[0]?.[1],
      );
      expect(document.activeElement).toBe(inserted);
      expect(caretOf(inserted)).toEqual([0, 0]);
    });

    it("does not insert when the next question is blank", () => {
      const { press, store } = render(["one", "  "]);

      const preventDefault = press(0, "Enter");

      expect(preventDefault).toHaveBeenCalled();
      expect(store.insertQuestion).not.toHaveBeenCalled();
    });

    it("does not insert below a blank question", () => {
      const { press, store } = render([" "]);

      const preventDefault = press(0, "Enter");

      expect(preventDefault).toHaveBeenCalled();
      expect(store.insertQuestion).not.toHaveBeenCalled();
    });

    it("with Shift leaves the line break to the browser", () => {
      const { press, store } = render(["one"]);

      const preventDefault = press(0, "Enter", { shiftKey: true });

      expect(preventDefault).not.toHaveBeenCalled();
      expect(store.insertQuestion).not.toHaveBeenCalled();
    });
  });

  describe("ArrowDown", () => {
    it("on the last line moves to the end of the next question's first line", () => {
      const { press, textareas } = render(["a\nlast", "first line\nsecond"]);

      const preventDefault = press(0, "ArrowDown");

      expect(preventDefault).toHaveBeenCalled();
      expect(document.activeElement).toBe(textareas[1]);
      expect(caretOf(textareas[1])).toEqual([10, 10]);
    });

    it("above the last line leaves the key to the browser", () => {
      const { press, textareas } = render(["a\nb", "c"]);

      const preventDefault = press(0, "ArrowDown", { cursor: 0 });

      expect(preventDefault).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(textareas[0]);
    });

    it("in the last question keeps focus and blocks the key", () => {
      const { press, textareas } = render(["a", "b"]);

      const preventDefault = press(1, "ArrowDown");

      expect(preventDefault).toHaveBeenCalled();
      expect(document.activeElement).toBe(textareas[1]);
    });
  });

  describe("ArrowUp", () => {
    it("on the first line moves to the end of the previous question's last line", () => {
      const { press, textareas } = render(["x\nprevious", "current"]);

      const preventDefault = press(1, "ArrowUp", { cursor: 0 });

      expect(preventDefault).toHaveBeenCalled();
      expect(document.activeElement).toBe(textareas[0]);
      expect(caretOf(textareas[0])).toEqual([10, 10]);
    });

    it("below the first line leaves the key to the browser", () => {
      const { press, textareas } = render(["a", "b\nc"]);

      const preventDefault = press(1, "ArrowUp");

      expect(preventDefault).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(textareas[1]);
    });

    it("in the first question keeps focus and blocks the key", () => {
      const { press, textareas } = render(["a", "b"]);

      const preventDefault = press(0, "ArrowUp", { cursor: 0 });

      expect(preventDefault).toHaveBeenCalled();
      expect(document.activeElement).toBe(textareas[0]);
    });
  });

  describe("Tab", () => {
    it("moves to the end of the next question", () => {
      const { press, textareas } = render(["a", "bcd"]);

      const preventDefault = press(0, "Tab", { cursor: 0 });

      expect(preventDefault).toHaveBeenCalled();
      expect(document.activeElement).toBe(textareas[1]);
      expect(caretOf(textareas[1])).toEqual([3, 3]);
    });

    it("with Shift moves to the end of the previous question", () => {
      const { press, textareas } = render(["abc", "d"]);

      const preventDefault = press(1, "Tab", { shiftKey: true });

      expect(preventDefault).toHaveBeenCalled();
      expect(document.activeElement).toBe(textareas[0]);
      expect(caretOf(textareas[0])).toEqual([3, 3]);
    });

    it("in the last question with text adds a question and focuses it", () => {
      const { press, store, createdTextareaFor } = render(["a"]);

      const preventDefault = press(0, "Tab");
      vi.runAllTimers();

      expect(preventDefault).toHaveBeenCalled();
      expect(store.addQuestion).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ text: "" }),
      );
      expect(store.announceLiveRegion).toHaveBeenCalledWith(
        "Added a new question below and focused it.",
      );
      const added = createdTextareaFor(store.addQuestion.mock.calls[0]?.[0]);
      expect(document.activeElement).toBe(added);
    });

    it("in a blank last question keeps focus in it", () => {
      const { press, store, textareas } = render(["a", " "]);

      const preventDefault = press(1, "Tab");
      vi.runAllTimers();

      expect(preventDefault).toHaveBeenCalled();
      expect(store.addQuestion).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(textareas[1]);
    });

    it("with Shift in the first question keeps focus in it", () => {
      const { press, textareas } = render(["a", "b"]);

      const preventDefault = press(0, "Tab", { shiftKey: true });

      expect(preventDefault).toHaveBeenCalled();
      expect(document.activeElement).toBe(textareas[0]);
    });
  });

  it.each([
    ["Enter", { ctrlKey: true }],
    ["Enter", { altKey: true }],
    ["Tab", { ctrlKey: true }],
    ["Tab", { altKey: true }],
    ["ArrowDown", { ctrlKey: true }],
    ["ArrowUp", { altKey: true }],
  ])("leaves %s with %o to other handlers", (key, modifiers) => {
    const { press, store, textareas } = render(["a", "b"]);

    const preventDefault = press(0, key, { cursor: 0, ...modifiers });
    vi.runAllTimers();

    expect(preventDefault).not.toHaveBeenCalled();
    expect(store.insertQuestion).not.toHaveBeenCalled();
    expect(store.addQuestion).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(textareas[0]);
  });

  it("does nothing while the textarea is not mounted", () => {
    const { questions, questionRefs, store } = render(["a"]);
    const preventDefault = vi.fn<() => void>();

    handleKeyPress(
      {
        key: "Enter",
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
        preventDefault,
      },
      {
        textareaRef: { current: null },
        questions,
        question: questions[0],
        questionRefs,
        ...store,
      },
    );

    expect(preventDefault).not.toHaveBeenCalled();
    expect(store.insertQuestion).not.toHaveBeenCalled();
  });
});

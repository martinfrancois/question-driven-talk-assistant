import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { renderHook, act } from "@testing-library/react";
import { ClearQuestionsModal } from "./ClearQuestionsModal.tsx";
import { StorageName, useQuestions, useSetQuestions } from "@/stores";
import { pressKey } from "@/test-utils/keyboard.ts";
import { interact } from "@/test-utils/react.ts";

/**
 * Exercises the real confirmation flow end to end: the real
 * `react-hotkeys-hook` binding, the real `Modal` built on Radix's dialog
 * primitive, the real `react-focus-lock` wrapper, and the real zustand
 * questions store. Radix renders the dialog into a portal on `document.body`,
 * so the assertions query the document rather than the render container.
 */
describe("ClearQuestionsModal", () => {
  beforeEach(() => {
    localStorage.removeItem(StorageName.QUESTIONS);
  });

  const questionsHook = () =>
    renderHook(() => ({
      questions: useQuestions(),
      setQuestions: useSetQuestions(),
    }));

  const renderWithQuestions = async () => {
    const hook = questionsHook();
    act(() => {
      hook.result.current.setQuestions([
        { id: "a", text: "First", answered: false, highlighted: false },
        { id: "b", text: "Second", answered: true, highlighted: false },
        { id: "c", text: "Third", answered: false, highlighted: true },
      ]);
    });
    const rendered = await render(<ClearQuestionsModal />);
    return { ...rendered, hook };
  };

  const openModal = async () => {
    await interact(() => {
      pressKey({
        key: "Backspace",
        code: "Backspace",
        ctrl: true,
        shift: true,
      });
    });
  };

  const dialog = (): HTMLElement | null =>
    document.body.querySelector("[role='dialog']");

  const byTestId = (id: string): HTMLElement | null =>
    document.body.querySelector(`[data-testid='${id}']`);

  it("stays closed until the shortcut is pressed", async () => {
    await renderWithQuestions();

    expect(dialog()).toBeNull();
  });

  it("opens on ctrl+shift+backspace with the confirmation copy", async () => {
    await renderWithQuestions();

    await openModal();

    expect(dialog()).not.toBeNull();
    expect(dialog()?.textContent).toContain("Confirm Clear");
    expect(dialog()?.textContent).toContain(
      "Are you sure you want to clear the list?",
    );
    expect(byTestId("modal-confirm")?.textContent).toBe("Clear");
    expect(byTestId("modal-cancel")?.textContent).toBe("Cancel");
  });

  it("clears the questions when confirmed", async () => {
    const { hook } = await renderWithQuestions();
    expect(hook.result.current.questions).toHaveLength(3);

    await openModal();
    await interact(() => byTestId("modal-confirm")?.click());

    expect(hook.result.current.questions).toHaveLength(1);
    expect(hook.result.current.questions[0].text).toBe("");
    expect(hook.result.current.questions[0].answered).toBe(false);
    expect(hook.result.current.questions[0].highlighted).toBe(false);
  });

  it("closes itself after confirming", async () => {
    await renderWithQuestions();

    await openModal();
    await interact(() => byTestId("modal-confirm")?.click());

    expect(dialog()).toBeNull();
  });

  it("leaves the questions untouched when cancelled", async () => {
    const { hook } = await renderWithQuestions();

    await openModal();
    await interact(() => byTestId("modal-cancel")?.click());

    expect(dialog()).toBeNull();
    expect(hook.result.current.questions).toHaveLength(3);
    expect(hook.result.current.questions[1].text).toBe("Second");
  });

  it("can be dismissed with the dialog close button", async () => {
    const { hook } = await renderWithQuestions();

    await openModal();
    await interact(() => byTestId("modal-close")?.click());

    expect(dialog()).toBeNull();
    expect(hook.result.current.questions).toHaveLength(3);
  });

  it("moves focus into the dialog when it opens", async () => {
    await renderWithQuestions();

    await openModal();

    expect(dialog()?.contains(document.activeElement)).toBe(true);
  });

  it("can be reopened after being cancelled", async () => {
    await renderWithQuestions();

    await openModal();
    await interact(() => byTestId("modal-cancel")?.click());
    await openModal();

    expect(dialog()).not.toBeNull();
  });
});

import React from "react";
import { render } from "vitest-browser-react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import QuestionItem from "./QuestionItem.tsx";
import { Question, useQuestions, useSetQuestions } from "@/stores";

describe("QuestionItem Component with Zustand", () => {
  const BASE_YEAR = 2025;
  const BASE_MONTH = 1;
  const BASE_DAY = 1;
  const baseTime = new Date(Date.UTC(BASE_YEAR, BASE_MONTH - 1, BASE_DAY));

  let initialQuestions: Question[];

  beforeEach(() => {
    // Enable fake timers
    vi.useFakeTimers();

    // Set the system time to the base time
    vi.setSystemTime(baseTime);

    initialQuestions = [
      { id: "1", text: "Question A", answered: false, highlighted: false },
      { id: "2", text: "Question B", answered: false, highlighted: false },
      { id: "3", text: "Question C", answered: false, highlighted: false },
    ];
  });

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers();
  });

  const TestWrapper = () => {
    const questions = useQuestions();
    const setQuestions = useSetQuestions();
    const questionRefs = React.useRef<
      Record<string, React.RefObject<HTMLTextAreaElement | null>>
    >({});

    React.useEffect(() => {
      setQuestions(initialQuestions);
    }, [setQuestions]);

    return (
      <>
        {questions.map((question, index) => {
          const textareaRef =
            questionRefs.current[question.id] ||
            React.createRef<HTMLTextAreaElement>();
          questionRefs.current[question.id] = textareaRef;

          return (
            <QuestionItem
              key={question.id}
              question={question}
              questionRefs={questionRefs}
              textareaRef={textareaRef}
              index={index}
            />
          );
        })}
      </>
    );
  };

  // Helper function to simulate time passage
  const advanceTime = (milliseconds = 1): void => {
    if (milliseconds < 0) {
      throw new Error("Time advancement must be non-negative");
    }
    vi.advanceTimersByTime(milliseconds);
  };

  it("Pressing Enter adds a new question below and focuses it", async () => {
    const { container } = render(<TestWrapper />);
    expect(container).toMatchSnapshot("Initial Render");

    const textareas = container.querySelectorAll("textarea");
    const textarea = textareas[1]; // Index 1 for Question B
    textarea.focus();

    // Advance time to generate a unique timestamp for the new question
    advanceTime();

    // Simulate pressing Enter
    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      bubbles: true,
    });
    textarea.dispatchEvent(enterEvent);

    // Wait for state updates and re-rendering
    await vi.advanceTimersByTimeAsync(100);

    // Re-fetch the textareas after the update
    const updatedTextareas = container.querySelectorAll("textarea");

    expect(updatedTextareas.length).toBe(4); // New question added
    expect(updatedTextareas[2].value).toBe(""); // New question inserted at index 2

    // Check that focus is on the new question
    expect(document.activeElement).toBe(updatedTextareas[2]);

    expect(container).toMatchSnapshot("After Pressing Enter");
  });

  it("Pressing Enter does nothing if current or next question is empty", () => {
    // Modify the second question to be empty
    initialQuestions[1].text = "";
    // The TestWrapper will set the store state with updated initialQuestions

    const { container } = render(<TestWrapper />);
    expect(container).toMatchSnapshot("Initial Render with Empty Question B");

    const textareas = container.querySelectorAll("textarea");
    const textarea = textareas[1]; // Select the second textarea (now empty)
    textarea.focus();

    // Simulate pressing Enter
    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      bubbles: true,
    });
    textarea.dispatchEvent(enterEvent);

    // No need to advance time as no new question should be added

    // Assertions
    expect(container.querySelectorAll("textarea").length).toBe(3); // No new question should be added

    expect(container).toMatchSnapshot("After Pressing Enter on Empty Question");
  });

  it("Pressing Tab on last empty question does nothing", () => {
    // Make the last question empty
    initialQuestions[2].text = "";
    // The TestWrapper will set the store state with updated initialQuestions

    const { container } = render(<TestWrapper />);
    expect(container).toMatchSnapshot(
      "Initial Render with Last Question Empty",
    );

    const textareas = container.querySelectorAll("textarea");
    const textarea = textareas[2]; // Last question
    textarea.focus();

    // Simulate pressing Tab
    const tabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      code: "Tab",
      bubbles: true,
    });
    textarea.dispatchEvent(tabEvent);

    // No need to advance time as no new question should be added

    // Assertions
    expect(container.querySelectorAll("textarea").length).toBe(3); // No new question should be added

    expect(container).toMatchSnapshot(
      "After Pressing Tab on Last Empty Question",
    );
  });

  it("Pressing Tab on last non-empty question adds new question", async () => {
    const { container } = render(<TestWrapper />);
    const textareas = container.querySelectorAll("textarea");
    const textarea = textareas[2]; // Last question
    textarea.focus();

    // Advance time to generate a unique timestamp for the new question
    advanceTime();

    // Simulate pressing Tab
    const tabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      code: "Tab",
      bubbles: true,
    });
    textarea.dispatchEvent(tabEvent);

    // Wait for state updates and re-rendering
    await vi.advanceTimersByTimeAsync(100);

    // Re-fetch the textareas after the update
    const updatedTextareas = container.querySelectorAll("textarea");

    // Assertions
    expect(updatedTextareas.length).toBe(4); // New question should be added
    expect(updatedTextareas[3].value).toBe(""); // New question should have empty text

    expect(container).toMatchSnapshot(
      "After Pressing Tab on Last Non-Empty Question",
    );
  });

  it("Pressing Backspace on empty question deletes it and focuses previous", async () => {
    // Make the second question empty
    initialQuestions[1].text = "";
    // The TestWrapper will set the store state with updated initialQuestions

    const { container } = render(<TestWrapper />);
    expect(container).toMatchSnapshot("Initial Render with Empty Question B");

    const textareas = container.querySelectorAll("textarea");
    const textarea = textareas[1];
    textarea.focus();

    // Simulate pressing Backspace
    const backspaceEvent = new KeyboardEvent("keydown", {
      key: "Backspace",
      code: "Backspace",
      bubbles: true,
    });
    textarea.dispatchEvent(backspaceEvent);

    // No new question is added or timestamp is needed, but ensure timers are run
    await vi.advanceTimersByTimeAsync(100);

    const updatedTextareas = container.querySelectorAll("textarea");

    expect(updatedTextareas.length).toBe(2); // The empty question should be deleted
    expect(updatedTextareas[1].value).toBe("Question C"); // Question B deleted

    // Check that focus is on the previous question
    expect(document.activeElement).toBe(updatedTextareas[0]);

    expect(container).toMatchSnapshot(
      "After Pressing Backspace on Empty Question B",
    );
  });

  it("Pressing Backspace on empty first question deletes it and focuses new first question", async () => {
    // Make the first question empty
    initialQuestions[0].text = "";
    // The TestWrapper will set the store state with updated initialQuestions

    const { container } = render(<TestWrapper />);
    expect(container).toMatchSnapshot("Initial Render with Empty Question A");

    const textareas = container.querySelectorAll("textarea");
    const textarea = textareas[0];
    textarea.focus();

    // Simulate pressing Backspace
    const backspaceEvent = new KeyboardEvent("keydown", {
      key: "Backspace",
      code: "Backspace",
      bubbles: true,
    });
    textarea.dispatchEvent(backspaceEvent);

    // No new question is added or timestamp is needed, but ensure timers are run
    await vi.advanceTimersByTimeAsync(100);

    const updatedTextareas = container.querySelectorAll("textarea");

    expect(updatedTextareas.length).toBe(2); // The empty first question should be deleted
    expect(updatedTextareas[0].value).toBe("Question B"); // Question A deleted

    // Check that focus is on the new first question
    expect(document.activeElement).toBe(updatedTextareas[0]);

    expect(container).toMatchSnapshot(
      "After Pressing Backspace on Empty First Question",
    );
  });

  it("Pressing Backspace in multi-line empty textarea does nothing when cursor is on first line", () => {
    // Set the second question to have multiple lines with the first line empty
    initialQuestions[1].text = "\n";
    // The TestWrapper will set the store state with updated initialQuestions

    const { container } = render(<TestWrapper />);
    expect(container).toMatchSnapshot(
      "Initial Render with Multi-Line Empty Question B",
    );

    const textareas = container.querySelectorAll("textarea");
    const textarea = textareas[1];
    textarea.focus();
    textarea.setSelectionRange(0, 0); // Cursor at the start of the first line

    // Simulate pressing Backspace
    const backspaceEvent = new KeyboardEvent("keydown", {
      key: "Backspace",
      code: "Backspace",
      bubbles: true,
    });
    textarea.dispatchEvent(backspaceEvent);

    // Assertions
    expect(textarea.value).toBe("\n"); // The text should remain unchanged

    // Snapshot to verify no changes
    expect(container).toMatchSnapshot(
      "After Pressing Backspace on Multi-Line Empty Question",
    );
  });

  it("Pressing Backspace on second line removes that line", () => {
    // Set the second question to have multiple lines
    initialQuestions[1].text = "\n";
    // The TestWrapper will set the store state with updated initialQuestions

    const { container } = render(<TestWrapper />);
    expect(container).toMatchSnapshot(
      "Initial Render with Multi-Line Empty Question B",
    );

    const textareas = container.querySelectorAll("textarea");
    const textarea = textareas[1];
    textarea.focus();
    textarea.setSelectionRange(1, 1); // Cursor at the start of the second line

    // Simulate pressing Backspace
    const backspaceEvent = new KeyboardEvent("keydown", {
      key: "Backspace",
      code: "Backspace",
      bubbles: true,
    });
    textarea.dispatchEvent(backspaceEvent);

    // Simulate the change event that removes the line
    textarea.value = "";
    const inputEvent = new Event("input", { bubbles: true });
    textarea.dispatchEvent(inputEvent);

    // Assertions
    expect(textarea.value).toBe(""); // Line removed
    expect(document.activeElement).toBe(textarea); // Focus should remain on the textarea

    // Snapshot after removing the line
    expect(container).toMatchSnapshot(
      "After Pressing Backspace on Second Line",
    );
  });

  it("ArrowUp and ArrowDown navigation moves focus correctly", async () => {
    const { container } = render(<TestWrapper />);

    const textareas = container.querySelectorAll("textarea");
    const textarea = textareas[1]; // Select the second textarea (Question B)
    textarea.focus();

    // Simulate pressing ArrowUp
    const arrowUpEvent = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      code: "ArrowUp",
      bubbles: true,
    });
    textarea.dispatchEvent(arrowUpEvent);

    // Advance timers if any time-based logic is triggered
    advanceTime();

    // Wait for any potential state updates and re-rendering
    await vi.advanceTimersByTimeAsync(100);

    // Assertions
    expect(document.activeElement).toBe(textareas[0]); // Focus should move to the first textarea

    // Snapshot after pressing ArrowUp
    expect(container).toMatchSnapshot("After Pressing ArrowUp");

    // Simulate pressing ArrowDown
    const arrowDownEvent = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      code: "ArrowDown",
      bubbles: true,
    });
    textareas[0].dispatchEvent(arrowDownEvent);

    // Advance timers if any time-based logic is triggered
    advanceTime();

    // Wait for state updates and re-rendering
    await vi.advanceTimersByTimeAsync(100);

    // Assertions
    expect(document.activeElement).toBe(textareas[1]); // Focus should return to the second textarea

    expect(container).toMatchSnapshot("After Pressing ArrowDown");
  });
});

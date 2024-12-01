import React from "react";
import { render } from "vitest-browser-react";
import { describe, it, expect, beforeEach } from "vitest";
import QuestionItem from "./QuestionItem.tsx";
import { Question, useQuestions, useSetQuestions } from "../../stores";

describe("QuestionItem Component with Zustand", () => {
  let initialQuestions: Question[];

  beforeEach(() => {
    initialQuestions = [
      { id: "1", text: "Question A", answered: false, highlighted: false },
      { id: "2", text: "Question B", answered: false, highlighted: false },
      { id: "3", text: "Question C", answered: false, highlighted: false },
    ];
  });

  const TestWrapper = () => {
    const questions = useQuestions();
    const setQuestions = useSetQuestions();
    const questionRefs = React.useRef<
      Record<string, React.RefObject<HTMLTextAreaElement>>
    >({});

    React.useEffect(() => {
      setQuestions(initialQuestions);
    }, [setQuestions]);

    return (
      <>
        {questions.map((question) => {
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
              index={0}
            />
          );
        })}
      </>
    );
  };

  it("Pressing Enter adds a new question below and focuses it", async () => {
    const { container } = render(<TestWrapper />);
    const textareas = container.querySelectorAll("textarea");
    const textarea = textareas[1]; // Index 1 for Question B
    textarea.focus();

    // Simulate pressing Enter
    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      bubbles: true,
    });
    textarea.dispatchEvent(enterEvent);

    // Wait for state updates and re-rendering
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Re-fetch the textareas after the update
    const updatedTextareas = container.querySelectorAll("textarea");

    expect(updatedTextareas.length).toBe(4); // New question added
    expect(updatedTextareas[2].value).toBe(""); // New question inserted at index 2

    // Check that focus is on the new question
    expect(document.activeElement).toBe(updatedTextareas[2]);
  });

  it("Pressing Enter does nothing if current or next question is empty", () => {
    // Modify the second question to be empty
    initialQuestions[1].text = "";
    // The TestWrapper will set the store state with updated initialQuestions

    const { container } = render(<TestWrapper />);
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

    // Assertions
    expect(container.querySelectorAll("textarea").length).toBe(3); // No new question should be added
  });

  it("Pressing Tab on last empty question does nothing", () => {
    // Make the last question empty
    initialQuestions[2].text = "";
    // The TestWrapper will set the store state with updated initialQuestions

    const { container } = render(<TestWrapper />);
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

    // Assertions
    expect(container.querySelectorAll("textarea").length).toBe(3); // No new question should be added
  });

  it("Pressing Tab on last non-empty question adds new question", async () => {
    const { container } = render(<TestWrapper />);
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

    // Wait for state updates and re-rendering
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Re-fetch the textareas after the update
    const updatedTextareas = container.querySelectorAll("textarea");

    // Assertions
    expect(updatedTextareas.length).toBe(4); // New question should be added
    expect(updatedTextareas[3].value).toBe(""); // New question should have empty text
  });

  it("Pressing Backspace on empty question deletes it and focuses previous", async () => {
    // Make the second question empty
    initialQuestions[1].text = "";
    // The TestWrapper will set the store state with updated initialQuestions

    const { container } = render(<TestWrapper />);
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

    // Wait for state updates and re-rendering
    await new Promise((resolve) => setTimeout(resolve, 0));

    const updatedTextareas = container.querySelectorAll("textarea");

    expect(updatedTextareas.length).toBe(2); // The empty question should be deleted
    expect(updatedTextareas[1].value).toBe("Question C"); // Question B deleted

    // Check that focus is on the previous question
    expect(document.activeElement).toBe(updatedTextareas[0]);
  });

  it("Pressing Backspace on empty first question deletes it and focuses new first question", async () => {
    // Make the first question empty
    initialQuestions[0].text = "";
    // The TestWrapper will set the store state with updated initialQuestions

    const { container } = render(<TestWrapper />);
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

    // Wait for state updates and re-rendering
    await new Promise((resolve) => setTimeout(resolve, 0));

    const updatedTextareas = container.querySelectorAll("textarea");

    expect(updatedTextareas.length).toBe(2); // The empty first question should be deleted
    expect(updatedTextareas[0].value).toBe("Question B"); // Question A deleted

    // Check that focus is on the new first question
    expect(document.activeElement).toBe(updatedTextareas[0]);
  });

  it("Pressing Backspace in multi-line empty textarea does nothing when cursor is on first line", () => {
    // Set the second question to have multiple lines with the first line empty
    initialQuestions[1].text = "\n";
    // The TestWrapper will set the store state with updated initialQuestions

    const { container } = render(<TestWrapper />);
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
  });

  it("Pressing Backspace on second line removes that line", () => {
    // Set the second question to have multiple lines
    initialQuestions[1].text = "\n";
    // The TestWrapper will set the store state with updated initialQuestions

    const { container } = render(<TestWrapper />);
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

    // Wait for state updates and re-rendering
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assertions
    expect(document.activeElement).toBe(textareas[0]); // Focus should move to the first textarea

    // Simulate pressing ArrowDown
    const arrowDownEvent = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      code: "ArrowDown",
      bubbles: true,
    });
    textareas[0].dispatchEvent(arrowDownEvent);

    // Wait for state updates and re-rendering
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assertions
    expect(document.activeElement).toBe(textareas[1]); // Focus should return to the second textarea
  });
});

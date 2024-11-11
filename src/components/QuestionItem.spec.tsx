import React from 'react';
import { render } from 'vitest-browser-react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import QuestionItem, {Question, UpdateFuncType} from './QuestionItem';

describe('QuestionItem Component', () => {
    let initialQuestions: Question[];

    beforeEach(() => {
        initialQuestions = [
            { id: '1', text: 'Question A', answered: false, highlighted: false },
            { id: '2', text: 'Question B', answered: false, highlighted: false },
            { id: '3', text: 'Question C', answered: false, highlighted: false },
        ];
    });

    const TestWrapper = () => {
        const [questions, setQuestions] = React.useState<Question[]>(initialQuestions);
        const questionRefs = React.useRef<Record<string, React.RefObject<HTMLTextAreaElement>>>({});

        const updateQuestions = vi.fn((updateFunc: UpdateFuncType) => {
            setQuestions((prevQuestions) => {
                const newQuestions = [...prevQuestions];
                updateFunc(newQuestions);

                // Update questionRefs when questions are added or removed
                newQuestions.forEach((q) => {
                    if (!questionRefs.current[q.id]) {
                        questionRefs.current[q.id] = React.createRef<HTMLTextAreaElement>();
                    }
                });
                Object.keys(questionRefs.current).forEach((key) => {
                    if (!newQuestions.find((q) => q.id === key)) {
                        delete questionRefs.current[key];
                    }
                });

                return newQuestions;
            });
        });

        return (
            <>
                {questions.map((question) => {
                    const textareaRef =
                        questionRefs.current[question.id] || React.createRef<HTMLTextAreaElement>();
                    questionRefs.current[question.id] = textareaRef;

                    return (
                        <QuestionItem
                            key={question.id}
                            question={question}
                            questions={questions}
                            questionRefs={questionRefs}
                            updateQuestions={updateQuestions}
                            textareaRef={textareaRef}
                        />
                    );
                })}
            </>
        );
    };

    it('Pressing Enter adds a new question below and focuses it', async () => {
        // given
        const { container } = render(<TestWrapper />);
        const textareas = container.querySelectorAll('textarea');
        const textarea = textareas[1]; // Index 1 for Question B
        textarea.focus();

        // when, simulate pressing Enter
        const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            bubbles: true,
        });
        textarea.dispatchEvent(enterEvent);

        // Wait for state updates and re-rendering
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Re-fetch the textareas after the update
        const updatedTextareas = container.querySelectorAll('textarea');

        expect(updatedTextareas.length).toBe(4); // New question added
        expect(updatedTextareas[2].value).toBe(''); // New question inserted at index 2

        // Check that focus is on the new question
        await expect.element(document.activeElement!).toBe(updatedTextareas[2]);
    });

    it('Pressing Enter does nothing if current or next question is empty', () => {
        // Set current question text to empty
        initialQuestions[1].text = '';
        const { container } = render(<TestWrapper />);
        const textareas = container.querySelectorAll('textarea');
        const textarea = textareas[1];
        textarea.focus();

        // Simulate pressing Enter
        const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            bubbles: true,
        });
        textarea.dispatchEvent(enterEvent);

        expect(container.querySelectorAll('textarea').length).toBe(3);
    });

    it('Pressing Tab on last empty question does nothing', () => {
        // Make last question empty
        initialQuestions[2].text = '';
        const { container } = render(<TestWrapper />);
        const textareas = container.querySelectorAll('textarea');
        const textarea = textareas[2]; // Last question
        textarea.focus();

        // Simulate pressing Tab
        const tabEvent = new KeyboardEvent('keydown', {
            key: 'Tab',
            code: 'Tab',
            bubbles: true,
        });
        textarea.dispatchEvent(tabEvent);

        expect(container.querySelectorAll('textarea').length).toBe(3);
    });

    it('Pressing Tab on last non-empty question adds new question', async () => {
        const { container } = render(<TestWrapper />);
        const textareas = container.querySelectorAll('textarea');
        const textarea = textareas[2]; // Last question
        textarea.focus();

        // Simulate pressing Tab
        const tabEvent = new KeyboardEvent('keydown', {
            key: 'Tab',
            code: 'Tab',
            bubbles: true,
        });
        textarea.dispatchEvent(tabEvent);

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(container.querySelectorAll('textarea').length).toBe(4);
        expect(container.querySelectorAll('textarea')[3].value).toBe(''); // New question added
    });

    it('Pressing Backspace on empty question deletes it and focuses previous', async () => {
        // Set question text to empty
        initialQuestions[1].text = '';
        const { container } = render(<TestWrapper />);
        const textareas = container.querySelectorAll('textarea');
        const textarea = textareas[1];
        textarea.focus();

        // Simulate pressing Backspace
        const backspaceEvent = new KeyboardEvent('keydown', {
            key: 'Backspace',
            code: 'Backspace',
            bubbles: true,
        });
        textarea.dispatchEvent(backspaceEvent);

        await new Promise((resolve) => setTimeout(resolve, 0));

        const updatedTextareas = container.querySelectorAll('textarea');

        expect(updatedTextareas.length).toBe(2);
        expect(updatedTextareas[1].value).toBe('Question C'); // Question B deleted

        // Check that focus is on previous question
        await expect.element(document.activeElement!).toBe(updatedTextareas[0]);
    });

    it('Pressing Backspace on empty first question deletes it and focuses new first question', async () => {
        // Set first question text to empty
        initialQuestions[0].text = '';
        const { container } = render(<TestWrapper />);
        const textareas = container.querySelectorAll('textarea');
        const textarea = textareas[0];
        textarea.focus();

        // Simulate pressing Backspace
        const backspaceEvent = new KeyboardEvent('keydown', {
            key: 'Backspace',
            code: 'Backspace',
            bubbles: true,
        });
        textarea.dispatchEvent(backspaceEvent);

        await new Promise((resolve) => setTimeout(resolve, 0));

        const updatedTextareas = container.querySelectorAll('textarea');

        expect(updatedTextareas.length).toBe(2);
        expect(updatedTextareas[0].value).toBe('Question B'); // Question A deleted

        // Check that focus is on new first question
        await expect.element(document.activeElement!).toBe(updatedTextareas[0]);
    });

    it('Pressing Backspace in multi-line empty textarea does nothing when cursor is on first line', () => {
        initialQuestions[1].text = '\n';
        const { container } = render(<TestWrapper />);
        const textareas = container.querySelectorAll('textarea');
        const textarea = textareas[1];
        textarea.focus();
        textarea.setSelectionRange(0, 0); // Cursor at the start (first line)

        // Simulate pressing Backspace
        const backspaceEvent = new KeyboardEvent('keydown', {
            key: 'Backspace',
            code: 'Backspace',
            bubbles: true,
        });
        textarea.dispatchEvent(backspaceEvent);

        expect(initialQuestions[1].text).toBe('\n');
    });

    it('Pressing Backspace on second line removes that line', async () => {
        initialQuestions[1].text = '\n';
        const { container } = render(<TestWrapper />);
        const textareas = container.querySelectorAll('textarea');
        const textarea = textareas[1];
        textarea.focus();
        textarea.setSelectionRange(1, 1); // Cursor at the start of the second line

        // Simulate pressing Backspace
        const backspaceEvent = new KeyboardEvent('keydown', {
            key: 'Backspace',
            code: 'Backspace',
            bubbles: true,
        });
        textarea.dispatchEvent(backspaceEvent);

        // Simulate the change event that removes the line
        textarea.value = '';
        const inputEvent = new Event('input', { bubbles: true });
        textarea.dispatchEvent(inputEvent);

        expect(textarea.value).toBe(''); // Line removed
        await expect.element(document.activeElement!).toBe(textarea); // Focus remains
    });

    it('ArrowUp and ArrowDown navigation moves focus correctly', async () => {
        const { container } = render(<TestWrapper />);
        const textareas = container.querySelectorAll('textarea');
        const textarea = textareas[1];
        textarea.focus();

        // Simulate pressing ArrowUp
        const arrowUpEvent = new KeyboardEvent('keydown', {
            key: 'ArrowUp',
            code: 'ArrowUp',
            bubbles: true,
        });
        textarea.dispatchEvent(arrowUpEvent);

        await new Promise((resolve) => setTimeout(resolve, 0));

        // Check that focus moved to previous question
        await expect.element(document.activeElement!).toBe(textareas[0]);

        // Simulate pressing ArrowDown
        const arrowDownEvent = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
            code: 'ArrowDown',
            bubbles: true,
        });
        textareas[0].dispatchEvent(arrowDownEvent);

        await new Promise((resolve) => setTimeout(resolve, 0));

        // Focus should return to the original textarea
        await expect.element(document.activeElement!).toBe(textareas[1]);
    });
});

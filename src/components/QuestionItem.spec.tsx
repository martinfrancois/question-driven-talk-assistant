import React from 'react';
import { render } from 'vitest-browser-react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import QuestionItem from './QuestionItem';

interface Question {
    id: string;
    text: string;
    answered: boolean;
    highlighted: boolean;
}

describe('QuestionItem Component', () => {
    let questions: Question[];
    let updateQuestions: Mock;
    let questionRefs: React.MutableRefObject<Record<string, React.RefObject<HTMLTextAreaElement>>>;

    beforeEach(() => {
        questions = [
            { id: '1', text: 'Question A', answered: false, highlighted: false },
            { id: '2', text: 'Question B', answered: false, highlighted: false },
            { id: '3', text: 'Question C', answered: false, highlighted: false },
        ];

        updateQuestions = vi.fn((updateFunc) => {
            const newQuestions = [...questions];
            updateFunc(newQuestions);

            // Update questionRefs when questions are added or removed
            if (newQuestions.length !== questions.length) {
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
            }

            questions = newQuestions;
        });

        questionRefs = {
            current: {
                '1': React.createRef(),
                '2': React.createRef(),
                '3': React.createRef(),
            },
        };
    });

    const renderQuestionItem = (question: Question) => {
        const textareaRef = React.createRef<HTMLTextAreaElement>();

        // Ensure that the questionRefs are updated
        questionRefs.current[question.id] = textareaRef;

        return render(
            <QuestionItem
                question={question}
                questions={questions}
                questionRefs={questionRefs}
                updateQuestions={updateQuestions}
                textareaRef={textareaRef}
            />
        );
    };

    it('Pressing Enter adds a new question below and focuses it', async () => {
        // given
        const { container } = renderQuestionItem(questions[1]); // Render Question B
        const textarea = container.querySelector('textarea')!;
        textarea.focus();

        // when, simulate pressing Enter
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
        textarea.dispatchEvent(enterEvent);

        // then
        expect(updateQuestions).toHaveBeenCalled();
        expect(questions.length).toBe(4);
        expect(questions[2].text).toBe(''); // New question inserted at index 2

        // Check that focus is on the new question
        const newQuestionRef = questionRefs.current[questions[2].id]?.current;
        expect.element(document.activeElement!).toBe(newQuestionRef);
    });

    it('Pressing Enter does nothing if current or next question is empty', () => {
        // Set current question text to empty
        questions[1].text = '';
        const { container } = renderQuestionItem(questions[1]);
        const textarea = container.querySelector('textarea')!;
        textarea.focus();

        // Simulate pressing Enter
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
        textarea.dispatchEvent(enterEvent);

        expect(updateQuestions).not.toHaveBeenCalled();
        expect(questions.length).toBe(3);
    });

    it('Pressing Tab on last empty question does nothing', () => {
        // Make last question empty
        questions[2].text = '';
        const { container } = renderQuestionItem(questions[2]); // Render last question
        const textarea = container.querySelector('textarea')!;
        textarea.focus();

        // Simulate pressing Tab
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true });
        textarea.dispatchEvent(tabEvent);

        expect(updateQuestions).not.toHaveBeenCalled();
        expect(questions.length).toBe(3);
    });

    it('Pressing Tab on last non-empty question adds new question', () => {
        const { container } = renderQuestionItem(questions[2]); // Render last question
        const textarea = container.querySelector('textarea')!;
        textarea.focus();

        // Simulate pressing Tab
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true });
        textarea.dispatchEvent(tabEvent);

        expect(updateQuestions).toHaveBeenCalled();
        expect(questions.length).toBe(4);
        expect(questions[3].text).toBe(''); // New question added
    });

    it('Pressing Backspace on empty question deletes it and focuses previous', () => {
        // Set question text to empty
        questions[1].text = '';
        const { container } = renderQuestionItem(questions[1]);
        const textarea = container.querySelector('textarea')!;
        textarea.focus();

        // Simulate pressing Backspace
        const backspaceEvent = new KeyboardEvent('keydown', { key: 'Backspace', code: 'Backspace', bubbles: true });
        textarea.dispatchEvent(backspaceEvent);

        expect(updateQuestions).toHaveBeenCalled();
        expect(questions.length).toBe(2);
        expect(questions[1].id).toBe('3'); // Question B deleted

        // Check that focus is on previous question
        const prevQuestionRef = questionRefs.current['1']?.current;
        expect.element(document.activeElement!).toBe(prevQuestionRef);
    });

    it('Pressing Backspace on empty first question deletes it and focuses new first question', () => {
        // Set first question text to empty
        questions[0].text = '';
        const { container } = renderQuestionItem(questions[0]);
        const textarea = container.querySelector('textarea')!;
        textarea.focus();

        // Simulate pressing Backspace
        const backspaceEvent = new KeyboardEvent('keydown', { key: 'Backspace', code: 'Backspace', bubbles: true });
        textarea.dispatchEvent(backspaceEvent);

        expect(updateQuestions).toHaveBeenCalled();
        expect(questions.length).toBe(2);
        expect(questions[0].id).toBe('2'); // Question A deleted

        // Check that focus is on new first question
        const newFirstQuestionRef = questionRefs.current['2']?.current;
        expect.element(document.activeElement!).toBe(newFirstQuestionRef);
    });

    it('Pressing Backspace in multi-line empty textarea does nothing when cursor is on first line', () => {
        questions[1].text = '\n';
        const { container } = renderQuestionItem(questions[1]);
        const textarea = container.querySelector('textarea')!;
        textarea.focus();
        textarea.setSelectionRange(0, 0); // Cursor at the start (first line)

        // Simulate pressing Backspace
        const backspaceEvent = new KeyboardEvent('keydown', { key: 'Backspace', code: 'Backspace', bubbles: true });
        textarea.dispatchEvent(backspaceEvent);

        expect(updateQuestions).not.toHaveBeenCalled();
        expect(questions[1].text).toBe('\n');
    });

    it('Pressing Backspace on second line removes that line', () => {
        questions[1].text = '\n';
        const { container } = renderQuestionItem(questions[1]);
        const textarea = container.querySelector('textarea')!;
        textarea.focus();
        textarea.setSelectionRange(1, 1); // Cursor at the start of the second line

        // Simulate pressing Backspace
        const backspaceEvent = new KeyboardEvent('keydown', { key: 'Backspace', code: 'Backspace', bubbles: true });
        textarea.dispatchEvent(backspaceEvent);

        // Simulate the change event that removes the line
        textarea.value = '';
        const inputEvent = new Event('input', { bubbles: true });
        textarea.dispatchEvent(inputEvent);

        expect(updateQuestions).toHaveBeenCalled();
        expect(questions[1].text).toBe(''); // Line removed
        expect(document.activeElement).toBe(textarea); // Focus remains
    });

    it('ArrowUp and ArrowDown navigation moves focus correctly', () => {
        const { container } = renderQuestionItem(questions[1]);
        const textarea = container.querySelector('textarea')!;
        textarea.focus();

        // Simulate pressing ArrowUp
        const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp', bubbles: true });
        textarea.dispatchEvent(arrowUpEvent);

        // Check that focus moved to previous question
        const prevQuestionRef = questionRefs.current['1']?.current;
        expect.element(document.activeElement!).toBe(prevQuestionRef);

        // Simulate pressing ArrowDown
        const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true });
        prevQuestionRef?.dispatchEvent(arrowDownEvent);

        // Focus should return to the original textarea
        expect.element(document.activeElement!).toBe(textarea);
    });

});

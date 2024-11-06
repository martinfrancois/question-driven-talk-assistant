import React, { FC, useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useHotkeys } from 'react-hotkeys-hook';
import { Checkbox } from '@material-tailwind/react';

interface Question {
    id: string;
    text: string;
    answered: boolean;
    highlighted: boolean;
}

interface QuestionItemProps {
    question: Question;
    questions: Question[];
    questionRefs: React.MutableRefObject<{ [key: string]: React.RefObject<HTMLTextAreaElement> }>;
    updateQuestions: (updateFunc: (draft: Question[]) => void) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
}

const QuestionItem: FC<QuestionItemProps> = ({
                                                 question,
                                                 questions,
                                                 questionRefs,
                                                 updateQuestions,
                                                 textareaRef,
                                             }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const baseClasses =
        'border-b outline-none focus:border-blue-500 transition-colors w-full resize-none';
    const textColor = question.highlighted ? 'text-yellow-700' : 'text-black dark:text-white';
    const bgColor = question.highlighted ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-transparent';

    const adjustHeight = () => {
        if (textareaRef?.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [question.text]);

    const [isFocused, setIsFocused] = useState(false);

    useHotkeys(
        'ctrl+shift+up',
        () => {
            const currentIndex = questions.findIndex((q) => q.id === question.id);
            if (currentIndex > 0) {
                updateQuestions((draft) => {
                    const temp = draft[currentIndex];
                    draft[currentIndex] = draft[currentIndex - 1];
                    draft[currentIndex - 1] = temp;
                });
            }
        },
        { enableOnFormTags: true, enabled: isFocused },
        [questions, question.id, updateQuestions, isFocused]
    );

    useHotkeys(
        'ctrl+shift+down',
        () => {
            const currentIndex = questions.findIndex((q) => q.id === question.id);
            if (currentIndex < questions.length - 1) {
                updateQuestions((draft) => {
                    const temp = draft[currentIndex];
                    draft[currentIndex] = draft[currentIndex + 1];
                    draft[currentIndex + 1] = temp;
                });
            }
        },
        { enableOnFormTags: true, enabled: isFocused },
        [questions, question.id, updateQuestions, isFocused]
    );

    const handleKeyPress = (e: React.KeyboardEvent) => {
        const currentIndex = questions.findIndex((q) => q.id === question.id);
        if (!textareaRef?.current) return;

        const textarea = textareaRef.current;
        const cursorPosition = textarea.selectionStart;

        // Get text before cursor
        const textBeforeCursor = textarea.value.substring(0, cursorPosition);
        // Split text before cursor into lines
        const linesBeforeCursor = textBeforeCursor.split('\n');
        // Current line number (0-based)
        const currentLineNumber = linesBeforeCursor.length - 1;
        // Total lines in the current textarea
        const totalLines = textarea.value.split('\n').length;

        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
            // Handle Enter key
            e.preventDefault();
            if (
                question.text.trim() !== '' &&
                (!questions[currentIndex + 1] || questions[currentIndex + 1].text.trim() !== '')
            ) {
                const newQuestion = {
                    id: Date.now().toString(),
                    text: '',
                    answered: false,
                    highlighted: false,
                };
                updateQuestions((draft) => {
                    draft.splice(currentIndex + 1, 0, newQuestion);
                });
                setTimeout(() => {
                    const nextQuestion = questions[currentIndex + 1];
                    if (nextQuestion) {
                        const nextRef = questionRefs.current[nextQuestion.id];
                        if (nextRef && nextRef.current) {
                            nextRef.current.focus();
                            nextRef.current.setSelectionRange(0, 0);
                        }
                    }
                }, 0);
            }
        } else if (e.key === 'ArrowDown' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
            const isAtLastLine = currentLineNumber === totalLines - 1;

            if (isAtLastLine) {
                // Cursor is at last line, move focus to next textarea
                e.preventDefault();
                if (currentIndex < questions.length - 1) {
                    const nextQuestion = questions[currentIndex + 1];
                    const nextRef = questionRefs.current[nextQuestion.id];
                    if (nextRef && nextRef.current) {
                        nextRef.current.focus();

                        // Place cursor at the end of the first line in the next textarea
                        const nextTextarea = nextRef.current;
                        const nextTextLines = nextTextarea.value.split('\n');

                        // First line index (0)
                        const lineIndex = 0;
                        let position = 0;
                        for (let i = 0; i <= lineIndex; i++) {
                            position += nextTextLines[i]?.length ?? 0;
                            if (i < lineIndex) position += 1; // +1 for newline
                        }
                        nextTextarea.setSelectionRange(position, position);
                    }
                }
            } else {
                // Allow default behavior (move cursor down within textarea)
            }
        } else if (e.key === 'ArrowUp' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
            const isAtFirstLine = currentLineNumber === 0;

            if (isAtFirstLine) {
                // Cursor is at first line, move focus to previous textarea
                e.preventDefault();
                if (currentIndex > 0) {
                    const prevQuestion = questions[currentIndex - 1];
                    const prevRef = questionRefs.current[prevQuestion.id];
                    if (prevRef && prevRef.current) {
                        prevRef.current.focus();

                        // Place cursor at the end of the last line in the previous textarea
                        const prevTextarea = prevRef.current;
                        const prevTextLines = prevTextarea.value.split('\n');

                        // Last line index
                        const lineIndex = prevTextLines.length - 1;
                        let position = 0;
                        for (let i = 0; i <= lineIndex; i++) {
                            position += prevTextLines[i]?.length ?? 0;
                            if (i < lineIndex) position += 1; // +1 for newline
                        }
                        prevTextarea.setSelectionRange(position, position);
                    }
                }
            } else {
                // Allow default behavior (move cursor up within textarea)
            }
        } else if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
            // Handle Tab key
            e.preventDefault();
            if (currentIndex < questions.length - 1) {
                // Not the last question
                const nextQuestion = questions[currentIndex + 1];
                const nextRef = questionRefs.current[nextQuestion.id];
                if (nextRef && nextRef.current) {
                    nextRef.current.focus();

                    // Set cursor at the end of the text in the next textarea
                    const nextTextarea = nextRef.current;
                    const position = nextTextarea.value.length;
                    nextTextarea.setSelectionRange(position, position);
                }
            } else {
                // Last textarea
                if (question.text.trim() !== '') {
                    // Text is not empty, add new question
                    const newQuestion = {
                        id: Date.now().toString(),
                        text: '',
                        answered: false,
                        highlighted: false,
                    };
                    updateQuestions((draft) => {
                        draft.push(newQuestion);
                    });
                    setTimeout(() => {
                        const newRef = questionRefs.current[newQuestion.id];
                        if (newRef && newRef.current) {
                            newRef.current.focus();
                            // Cursor at position 0 in new empty textarea
                            newRef.current.setSelectionRange(0, 0);
                        }
                    }, 0);
                } else {
                    // Text is empty, do nothing
                    // No action needed
                }
            }
        } else if (e.key === 'Tab' && e.shiftKey && !e.ctrlKey && !e.altKey) {
            // Handle Shift+Tab key
            e.preventDefault();
            if (currentIndex > 0) {
                const prevQuestion = questions[currentIndex - 1];
                const prevRef = questionRefs.current[prevQuestion.id];
                if (prevRef && prevRef.current) {
                    prevRef.current.focus();

                    // Set cursor at the end of the text in the previous textarea
                    const prevTextarea = prevRef.current;
                    const position = prevTextarea.value.length;
                    prevTextarea.setSelectionRange(position, position);
                }
            }
        }
        // Shift+Enter is not handled here to allow default behavior (line break)
    };

    return (
        <div
            style={style}
            className={`flex items-center ${question.highlighted ? 'bg-yellow-200' : ''}`}
        >
            <div
                ref={setNodeRef}
                {...attributes}
                {...listeners}
                className="text-2xl cursor-grab hover:text-gray-500 opacity-0 hover:opacity-100 transition-opacity p-2"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
            >
                &#9776;
            </div>
            <Checkbox
                checked={question.answered}
                onChange={() => {
                    updateQuestions((draft) => {
                        const idx = draft.findIndex((q) => q.id === question.id);
                        if (idx !== -1) {
                            draft[idx].answered = !draft[idx].answered;
                            draft[idx].highlighted = false;
                        }
                    });
                }}
                onClick={() => {
                    if (!question.answered) {
                        updateQuestions((draft) => {
                            draft.forEach((q) => (q.highlighted = false));
                            const idx = draft.findIndex((q) => q.id === question.id);
                            if (idx !== -1) {
                                draft[idx].highlighted = true;
                            }
                        });
                    }
                }}
                ripple={false}
                className="text-gray-700 dark:text-white dark:bg-gray-800 dark:border-gray-700"
            />
            <textarea
                ref={textareaRef}
                className={`${baseClasses} ${textColor} ${bgColor}`}
                value={question.text}
                onChange={(e) => {
                    const newText = e.target.value;
                    updateQuestions((draft) => {
                        const idx = draft.findIndex((q) => q.id === question.id);
                        if (idx !== -1) {
                            draft[idx].text = newText;
                        }
                    });
                    adjustHeight();
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyPress}
                rows={1}
                style={{ overflow: 'hidden' }}
            />
        </div>
    );
};

export default QuestionItem;

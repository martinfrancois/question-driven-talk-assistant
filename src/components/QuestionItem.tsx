import React, { FC, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Question {
    id: string;
    text: string;
    answered: boolean;
    highlighted: boolean;
}

interface QuestionItemProps {
    question: Question;
    index: number;
    questions: Question[];
    questionRefs: React.MutableRefObject<React.RefObject<HTMLTextAreaElement>[]>;
    updateQuestions: (updateFunc: (draft: Question[]) => void) => void;
}

const QuestionItem: FC<QuestionItemProps> = ({ question, index, questions, questionRefs, updateQuestions }) => {
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

    const textareaRef = questionRefs.current[index];

    // Dark mode-aware classes
    const baseClasses = "border-b outline-none focus:border-blue-500 transition-colors w-full resize-none";
    const textColor = question.highlighted ? "text-yellow-700" : "text-black dark:text-white";
    const bgColor = question.highlighted ? "bg-yellow-100 dark:bg-yellow-900" : "bg-transparent";

    // Auto-adjust height based on content
    const adjustHeight = () => {
        if (textareaRef?.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [question.text]);

    // Check if the next item is empty
    const isNextItemEmpty = () => {
        return questions[index + 1] && questions[index + 1].text.trim() === '';
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();

            // Only create a new item if the current text area is not empty
            // and there isn't an empty item below
            if (question.text.trim() !== '' && !isNextItemEmpty()) {
                updateQuestions((draft) => {
                    draft.splice(index + 1, 0, {
                        id: Date.now().toString(),
                        text: '',
                        answered: false,
                        highlighted: false,
                    });
                });

                // Update refs and focus the new item
                setTimeout(() => {
                    const nextRef = questionRefs.current[index + 1];
                    if (nextRef) {
                        nextRef.current?.focus();
                    }
                }, 0);
            }
        } else if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();

            // Move focus to the next item if it exists
            if (questionRefs.current[index + 1]) {
                questionRefs.current[index + 1].current?.focus();
            }
        } else if (e.key === 'Tab' && e.shiftKey) {
            e.preventDefault();

            // Move focus to the previous item if it exists
            if (questionRefs.current[index - 1]) {
                questionRefs.current[index - 1].current?.focus();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            // Move focus to the next item with ArrowDown
            if (questionRefs.current[index + 1]) {
                questionRefs.current[index + 1].current?.focus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            // Move focus to the previous item with ArrowUp
            if (questionRefs.current[index - 1]) {
                questionRefs.current[index - 1].current?.focus();
            }
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`flex items-center ${question.highlighted ? 'bg-yellow-200' : ''}`}
        >
            <div
                {...listeners}
                className="cursor-grab mr-2 hover:text-gray-500"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                style={{ visibility: isDragging ? 'visible' : 'hidden' }}
            >
                &#9776;
            </div>
            <input
                type="checkbox"
                checked={question.answered}
                onChange={() =>
                    updateQuestions((draft) => {
                        draft[index].answered = !draft[index].answered;
                        draft[index].highlighted = false;
                    })
                }
                onClick={() => {
                    if (!question.answered) {
                        updateQuestions((draft) => {
                            draft.forEach((q) => (q.highlighted = false));
                            draft[index].highlighted = true;
                        });
                    }
                }}
                className="mr-2 accent-gray-700 dark:accent-white"
            />
            <textarea
                ref={textareaRef}
                className={`${baseClasses} ${textColor} ${bgColor}`}
                value={question.text}
                onChange={(e) => {
                    updateQuestions((draft) => {
                        draft[index].text = e.target.value;
                    });
                    adjustHeight();
                }}
                onKeyDown={handleKeyPress}
                rows={1}
                style={{ overflow: 'hidden' }}
            />
        </div>
    );
};

export default QuestionItem;

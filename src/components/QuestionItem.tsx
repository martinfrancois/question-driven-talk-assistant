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

    const baseClasses = "border-b outline-none focus:border-blue-500 transition-colors w-full resize-none";
    const textColor = question.highlighted ? "text-yellow-700" : "text-black dark:text-white";
    const bgColor = question.highlighted ? "bg-yellow-100 dark:bg-yellow-900" : "bg-transparent";

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

    // TODO not fully working yet
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

    // TODO not fully working yet
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
        if (!e.ctrlKey && !e.shiftKey) {
            return;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (question.text.trim() !== '' && (questions[index + 1] ? questions[index + 1].text.trim() !== '' : true)) {
                updateQuestions((draft) => {
                    draft.splice(index + 1, 0, {
                        id: Date.now().toString(),
                        text: '',
                        answered: false,
                        highlighted: false,
                    });
                });
                setTimeout(() => {
                    const nextRef = questionRefs.current[index + 1];
                    if (nextRef) {
                        nextRef.current?.focus();
                    }
                }, 0);
            }
        } else if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            if (questionRefs.current[index + 1]) {
                questionRefs.current[index + 1].current?.focus();
            }
        } else if (e.key === 'Tab' && e.shiftKey) {
            e.preventDefault();
            if (questionRefs.current[index - 1]) {
                questionRefs.current[index - 1].current?.focus();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (questionRefs.current[index + 1]) {
                questionRefs.current[index + 1].current?.focus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (questionRefs.current[index - 1]) {
                questionRefs.current[index - 1].current?.focus();
            }
        }
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
                        draft[index].answered = !draft[index].answered;
                        draft[index].highlighted = false;
                    });
                }}
                onClick={() => {
                    if (!question.answered) {
                        updateQuestions((draft) => {
                            draft.forEach((q) => (q.highlighted = false));
                            draft[index].highlighted = true;
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
                    updateQuestions((draft) => {
                        draft[index].text = e.target.value;
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

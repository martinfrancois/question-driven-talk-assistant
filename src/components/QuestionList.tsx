import React, { FC, useRef } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    KeyboardSensor,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    rectSortingStrategy,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import QuestionItem from './QuestionItem';

interface Question {
    id: string;
    text: string;
    answered: boolean;
    highlighted: boolean;
}

interface QuestionListProps {
    questions: Question[];
    updateQuestions: (updateFunc: (draft: Question[]) => void) => void;
}

const QuestionList: FC<QuestionListProps> = ({ questions, updateQuestions }) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = questions.findIndex((q) => q.id === active.id);
            const newIndex = questions.findIndex((q) => q.id === over.id);

            updateQuestions((draft) => {
                return arrayMove(draft, oldIndex, newIndex);
            });
        }
    };

    // Use a mapping from question ID to ref, creating refs only once
    const questionRefs = useRef<Record<string, React.RefObject<HTMLTextAreaElement>>>({});

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={questions.map((q) => q.id)} strategy={rectSortingStrategy}>
                <div className="space-y-2">
                    {questions.map((question) => {
                        // Create a ref for each question if it doesn't exist
                        if (!questionRefs.current[question.id]) {
                            questionRefs.current[question.id] = React.createRef<HTMLTextAreaElement>();
                        }
                        return (
                            <QuestionItem
                                key={question.id}
                                question={question}
                                questions={questions}
                                questionRefs={questionRefs}
                                updateQuestions={updateQuestions}
                                textareaRef={questionRefs.current[question.id]}
                            />
                        );
                    })}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default QuestionList;
